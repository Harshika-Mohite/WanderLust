const Listing = require("../models/listing");
const axios = require("axios");
const mapTilerKey = "nOQObUQWP1nl4VOlphj8"; 


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index', { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    let { _id } = req.params;
    const listing = await Listing.findById(_id)
        .populate( {path: "reviews", populate: { path: "author",}, })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render('listings/show', { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        const address = req.body.listing.location;
        const response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${mapTilerKey}&limit=2`);

        if (response.data.features.length === 0) {
            req.flash("error", "Location not found!");
            return res.redirect("/listings/new");
        }

        const coordinates = response.data.features[0].geometry.coordinates; // [lng, lat]

        const url = req.file.path;
        const filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // Add geometry (GeoJSON format)
        newListing.geometry = {
            type: "Point",
            coordinates: coordinates
        };

        const savedListing = await newListing.save();
        console.log(savedListing);

        req.flash("success", "New Listing Created!");
        res.redirect(`/listings`);
    } catch (err) {
        next(err);
    }
};


// module.exports.createListing = async (req, res, next) => {
//     let response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json?key=${mapTilerKey}&limit=2`);

//     console.log(response.data.features);
//     res.send("done");

//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename};
//     let savedListing = await newListing.save();
//     console.log(savedListing);
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

// module.exports.createListing = async (req, res, next) => {
//     try {
//         const locationQuery = encodeURIComponent(req.body.listing.location);
//         const geoUrl = `https://api.maptiler.com/geocoding/${locationQuery}.json?key=${mapTilerKey}`;

//         const geoResponse = await axios.get(geoUrl);
        
//         if (geoResponse.data && geoResponse.data.features.length > 0) {
//             const coordinates = geoResponse.data.features[0].geometry.coordinates; // [longitude, latitude]

//             let url = req.file.path;
//             let filename = req.file.filename;

//             const newListing = new Listing(req.body.listing);
//             newListing.owner = req.user._id;
//             newListing.image = { url, filename };
//             newListing.location = req.body.listing.location;
//             newListing.geometry = { type: "Point", coordinates }; // Store geolocation

//             await newListing.save();

//             req.flash("success", "New Listing Created!");
//             res.redirect(`/listings/${newListing._id}`);
//         } else {
//             req.flash("error", "Invalid location, please try again.");
//             res.redirect("/listings/new");
//         }
//     } catch (error) {
//         console.error(error);
//         req.flash("error", "Something went wrong with geocoding.");
//         res.redirect("/listings/new");
//     }
// };

// module.exports.createListing = async (req, res, next) => {
//     try {
//         // Extract location from the form
//         const location = req.body.listing.location; 
//         console.log("User Input Location:", location); // Debugging log

//         // Extract image details
//         let url = req.file?.path || "";
//         let filename = req.file?.filename || "";

//         // Create new listing object
//         const newListing = new Listing({
//             ...req.body.listing, // Spread existing listing data
//             owner: req.user._id,
//             image: { url, filename },
//             location: location, // Store location name
//             coordinates: {
//                 lat: coordinates.latitude,
//                 lng: coordinates.longitude
//             } // Store coordinates separately for better readability
//         });

//         // Save listing to the database
//         await newListing.save();

//         req.flash("success", "New Listing Created!");
//         res.redirect(`/listings/${newListing._id}`);
//     } catch (error) {
//         console.error("Error creating listing:", error);
//         req.flash("error", "Something went wrong while creating the listing.");
//         res.redirect("/listings/new");
//     }
// };

module.exports.renderEditForm = async (req, res) => {
    let { _id } = req.params;
    const listing = await Listing.findById(_id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let orgImgUrl = listing.image.url;
    orgImgUrl = orgImgUrl.replace("/upload", "/upload/h_300,w_250");
    res.render('listings/edit', { listing, orgImgUrl });
};

module.exports.updateListing = async (req, res) => {
    let { _id } = req.params;
    let listing = await Listing.findByIdAndUpdate(_id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${_id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { _id } = req.params;
    await Listing.findByIdAndDelete(_id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
