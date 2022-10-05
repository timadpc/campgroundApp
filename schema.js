const basejoi = require('joi'); // validator wich runs before mongoose, easier to work with
const sanitizeHtml = require('sanitize-html')


const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHtml': '{{#label}} cannot include HTML'
  },
  rules: {
    escapeHtml: {
      validate(value, helpers) {
        const cleanInput = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        });
        if (cleanInput !== value) {
          return helpers.error('string.escapeHtml', { value })
        } else { return cleanInput; }
      }
    }
  }
})

const joi = basejoi.extend(extension) /// new joi hase now extension, which doesnt allow include HTML


module.exports.campgroundSchema = joi.object({
  campground: joi.object({
    title: joi.string().required().escapeHtml(),
    price: joi.number().required().min(0),
    location: joi.string().required().escapeHtml(),
    // images: joi.string().required(),
    description: joi.string().required().escapeHtml()
  }).required(),
  deleteImages: joi.array()

});


module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    text: joi.string().required()
  }).required()
});
