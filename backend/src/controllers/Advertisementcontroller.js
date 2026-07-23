// controllers/advertisementController.js
import Advertisement from "../models/Advertisement.js";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — CustomerHome fetch பண்ண (token தேவையில்லை)
// GET /api/advertisements
// Active + scheduled-but-within-date ads மட்டும் return ஆகும்
// ─────────────────────────────────────────────────────────────────────────────
export const getActiveAdvertisements = async (req, res) => {
  try {
    const now = new Date();

    const ads = await Advertisement.find({
      status: "active",
      $or: [
        { startDate: null },
        { startDate: { $lte: now } },
      ],
      $or: [
        { endDate: null },
        { endDate: { $gte: now } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .populate("linkedProduct", "name price mrp image category")
      .lean();

    // ── View count increment (fire-and-forget, no await) ──
    const ids = ads.map((a) => a._id);
    Advertisement.updateMany({ _id: { $in: ids } }, { $inc: { views: 1 } }).catch(
      () => {}
    );

    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — CRM: all ads (active + inactive + scheduled)
// GET /api/advertisements/all
// ─────────────────────────────────────────────────────────────────────────────
export const getAllAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find()
      .sort({ priority: -1, createdAt: -1 })
      .populate("linkedProduct", "name price image")
      .lean();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Create Advertisement
// POST /api/advertisements
// ─────────────────────────────────────────────────────────────────────────────
export const createAdvertisement = async (req, res) => {
  try {
    const {
      title, subtitle, description, bannerImage,
      ctaText, ctaLink, offerText, badgeText,
      position, status, priority, startDate, endDate,
      linkedProduct, seo,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const ad = await Advertisement.create({
      title, subtitle, description, bannerImage,
      ctaText, ctaLink, offerText, badgeText,
      position, status, priority,
      startDate: startDate || null,
      endDate:   endDate   || null,
      linkedProduct: linkedProduct || null,
      seo: seo || {},
    });

    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Update Advertisement
// PUT /api/advertisements/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("linkedProduct", "name price image");

    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Delete Advertisement
// DELETE /api/advertisements/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    res.json({ message: "Advertisement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Track CTA Click
// POST /api/advertisements/:id/click
// ─────────────────────────────────────────────────────────────────────────────
export const trackClick = async (req, res) => {
  try {
    await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};