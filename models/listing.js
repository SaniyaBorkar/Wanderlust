const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
    },
    description: {
      type:String,
    },
    image: {
      url: String,
      filename: String,
    },
    // image: {
    //     filename: {
    //         type: String,
    //         default: "listingimage",
    //     },
    //     url: {
    //         type: String,
    //         default: "https://images.unsplash.com/photo-1538964173425-93884d739596?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            // The default image is the above link
        // },
        // set: (v) => v === "" ? "https://images.unsplash.com/photo-1538964173425-93884d739596?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
        // If the user does not have any image, then we are setting the image as the above link
    // },
    price: Number,
    location: String,
    country: String,
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: "Review",
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
})

listingSchema.post("findOneAndDelete", async (listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }
  
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;