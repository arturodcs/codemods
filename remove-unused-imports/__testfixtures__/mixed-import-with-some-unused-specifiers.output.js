import React, { useState } from "react";

function App() {
  const [state, setState] = useState(null);
  return <div>{state}</div>;
}

export default App;
