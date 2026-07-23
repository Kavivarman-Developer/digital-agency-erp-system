// models/Advertisement.js
import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    // ── Core 
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // ── Banner Image (Cloudinary URL) 
    bannerImage: {
      type: String,
      default: "",
    },

    // ── CTA Button 
    ctaText: {
      type: String,
      default: "Shop Now",
    },
    ctaLink: {
      type: String,
      default: "",
    },

    // ── Offer / Badge 
    offerText: {
      type: String,
      default: "", // e.g. "Up to 80% OFF"
    },
    badgeText: {
      type: String,
      default: "", // e.g. "NEW LAUNCH" / "HOT DEAL"
    },

    // ── Display Settings 
    position: {
      type: String,
      enum: ["hero", "top-banner", "mid-banner", "popup"],
      default: "hero",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "scheduled"],
      default: "active",
    },
    priority: {
      type: Number,
      default: 0, // Higher = shown first
    },

    // ── Schedule (optional) 
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // ── Linked Product (optional) 
    linkedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // ── SEO Fields 
    seo: {
      metaTitle: {
        type: String,
        default: "",
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        default: "",
        maxlength: 160,
      },
      keywords: {
        type: [String],
        default: [],
      },
      ogTitle: {
        type: String,
        default: "",
      },
      ogDescription: {
        type: String,
        default: "",
      },
      ogImage: {
        type: String,
        default: "", // Usually same as bannerImage
      },
    },

    // ── Analytics (readonly — backend updates) 
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Index: fetch active ads sorted by priority fast 
advertisementSchema.index({ status: 1, priority: -1 });

export default mongoose.model("Advertisement", advertisementSchema);