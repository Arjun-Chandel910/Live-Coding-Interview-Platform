export default authMiddleware = async (req, res) => {
  const token = await req.headers("auth-token");
  const decoded = jwt.verify(token, "shhhhh");
  console.log(decoded);
};
