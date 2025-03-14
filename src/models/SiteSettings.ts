import mongoose from 'mongoose';

export interface ISiteSettings extends mongoose.Document {
  featuredPostId: number | null;
  updatedAt: Date;
}

const siteSettingsSchema = new mongoose.Schema({
  featuredPostId: {
    type: Number,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

// Singleton-Pattern: Es gibt immer nur ein Settings-Dokument
siteSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ featuredPostId: null });
  }
  return settings;
};

const SiteSettings = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);

export default SiteSettings; 