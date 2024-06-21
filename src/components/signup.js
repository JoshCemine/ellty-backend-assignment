import React from 'react';

function SignupForm({ onToggle }) {
  const handleSignup = (event) => {
    event.preventDefault();
    // Handle signup logic here
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="text" name="firstname" placeholder="First Name" required />
        <input type="text" name="lastname" placeholder="Last Name" required />
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={onToggle}>
        Already have an account?
      </button>
    </div>
  );
}

export default SignupForm;
