const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
    
}

module.exports.renderNewForm = (req,res)=>{
    console.log(req.user);
    
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id).populate({path: "reviews", populate:{path: "author"} }).populate("owner");
    
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing.geometry);
    res.render("listings/show.ejs", {listing});
}

// module.exports.createListing = async (req,res,next)=>{
//     let url = req.file.path;
//     let filename = req.file.filename;
//     console.log(url, "..", filename);
    // const newListing = new Listing(req.body.listing);
    
    // newListing.owner = req.user._id;
    // await newListing.save();
//     req.flash("success","New Listing created");
//     res.redirect("/listings");
// }

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
    
    

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;
      console.log(newListing.geometry);
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}



module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    console.log(listing);
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

module.exports.updateListing = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});


    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    

    console.log(listing);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
    }

// module.exports.updateListing = async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     if (typeof req.file !== "undefined") {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = { url, filename };
//     }
//     let updatedListing = await listing.save();
//     updateListingInDatabase(id, updatedListing)
//         .then(() => {
//             // Redirect to the show page after successful update
//             req.flash("success", "Listing updated!")
//             res.redirect(303, `/listings/${id}?updated=true`);
//         })
//         .catch(err => {
//             console.error('Error updating listing:', err);
//             res.status(500).send('Internal Server Error');
//         });
// };



        
module.exports.destroyListing = async (req,res)=>{
            let {id} = req.params;
            let deletedListing = await Listing.findByIdAndDelete(id);
            req.flash("success"," Listing deleted");
            res.redirect("/listings");
            }