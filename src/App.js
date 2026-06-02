import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {
 return (
  <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
   <h1>My Full-Stack Auth App</h1>
   <Signup />
   <hr style={{ margin: "40px 0" }} />
   <Login />
  </div>
 );
}

export default App;