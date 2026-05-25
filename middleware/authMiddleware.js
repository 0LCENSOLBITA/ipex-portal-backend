const jwt =
  require("jsonwebtoken");

module.exports =
  async (
    req,
    res,
    next
  ) => {

    try {

      const authHeader =
        req.headers.authorization;

      if (!authHeader) {

        return res
          .status(401)
          .json({
            error:
              "Unauthorized",
          });
      }

      const token =
        authHeader.replace(
          "Bearer ",
          ""
        );

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      req.user =
        decoded;

      next();

    } catch (err) {

      return res
        .status(401)
        .json({
          error:
            "Invalid token",
        });
    }
  };