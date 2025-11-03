import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Home Page!</h1>
      <Link to="/login">
        <button style={{ marginTop: "20px", padding: "10px 20px" }}>Go to Login</button>
      </Link>

       <Link to="/register">
        <button style={{ marginTop: "20px", padding: "10px 20px" }}>Go to Register</button>
      </Link>
    </div>
  );
};

export default Home;