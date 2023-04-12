import Product from "../models/ProductModel.js";
import slugify from "slugify";
import User from "../models/UserModel.js";

export const createProduct = async (req, res) => {
  const { title, description, price, category, brand, quantity, color } = req.body;
  const { id } = req.user;

  const file = req.file;
  const url = file.path;

  try {
    const data = await Product.create({
      title: title,
      slug: slugify(title),
      description: description,
      price: price,
      category: category,
      brand: brand,
      quantity: quantity,
      color: color,
      seller: id,
      thumbnail: url,
    });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  //filtering
  const { brand } = req.query;
  const { pricegte, pricelte } = req.query;
  const filter = {};

  if (brand) {
    filter.brand = { $regex: `^${brand}$`, $options: "i" };
  }
  if (pricegte && pricelte) {
    filter.price = { $gte: pricegte, $lte: pricelte };
  }

  //sorting
  let { sorting } = req.query;
  if (sorting) {
    sorting = sorting.split(",").join(" ");
  } else {
    sorting = "createdAt";
  }

  //limiting field
  let { fields } = req.query;
  if (fields) {
    fields = fields.split(",").join(" ");
  } else {
    fields = "-__v";
  }

  try {
    const data = await Product.find(filter)
      .sort({ [sorting]: 1 })
      .select(fields);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Product.findById(id);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//seller only
export const getMyProducts = async (req, res) => {
  const { id } = req.user;

  try {
    const data = await Product.find({ seller: id });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.params;
  const { title, description, price, category, brand, quantity, color } = req?.body;

  //images
  const file = req?.file;
  const url = file?.path;

  const product = await Product.findById(prodId);

  let thumbnail;
  if (!file) {
    thumbnail = product.thumbnail;
  } else {
    thumbnail = url;
  }
  let slug;
  if (title) {
    slug = slugify(title);
  }

  try {
    const data = await Product.findOneAndUpdate(
      { seller: id, _id: prodId },
      {
        title: title,
        slug: slug,
        description: description,
        price: price,
        category: category,
        brand: brand,
        quantity: quantity,
        color: color,
        thumbnail: url,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.params;

  try {
    const data = await Product.findOneAndDelete({ seller: id, _id: prodId });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWishlist = async (req, res) => {
  const { prodId } = req.body;
  const { id } = req.user;
  const user = await User.findById(id);

  const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId.toString());

  let wish;
  if (alreadyAdded) {
    wish = await User.findByIdAndUpdate(
      user.id,
      {
        $pull: { wishlist: prodId },
      },
      {
        new: true,
      }
    );
  } else {
    wish = await User.findByIdAndUpdate(
      user.id,
      {
        $push: { wishlist: prodId },
      },
      {
        new: true,
      }
    );
  }
  res.status(200).json({
    wish,
  });
};

export const ratings = async (req, res) => {
  const { prodId, comment, star } = req.body;
  const { id } = req.user;

  const user = await User.findById(id);
  const product = await Product.findById(prodId);
  const alreadyRated = product.ratings.find((rating) => rating.postedby.toString() === id.toString());

  try {
    if (alreadyRated) {
      await Product.updateOne(
        {
          ratings: {
            $elemMatch: alreadyRated,
          },
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
          },
        },
        {
          new: true,
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: user.id,
            },
          },
        },
        {
          new: true,
        }
      );
    }

    const getAllRatings = await Product.findById(prodId);
    const totalRating = getAllRatings.ratings.length;
    const totalStar = getAllRatings.ratings.map((rating) => rating.star).reduce((prev, curr) => prev + curr);
    const actualTotalRating = Math.round(totalStar / totalRating);

    const data = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualTotalRating,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addImagesProduct = async (req, res) => {
  const { id } = req.user;
  const { prodId } = req.params;

  const files = req.files;
  const object = {};
  for (const file of files) {
    object.url = file.path;
  }
  console.log(files);
  console.log(object);

  try {
    const data = await Product.findOneAndUpdate(
      {
        _id: prodId,
        seller: id,
      },
      {
        $push: { images: object },
      },
      {
        new: true,
      }
    );
    res.json({ data: data.images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
