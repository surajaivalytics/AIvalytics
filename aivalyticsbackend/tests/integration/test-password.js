const passwordUtils = require("./src/utils/password");

async function testPassword() {
  console.log("Testing password verification...");

  const password = "Test@123";
  const hash = "$2a$12$NgUt4NZ/MoBeEbx74hahmOVdPnpenSG4t94aKnVhhAa/v34fBYBfG";

  console.log("Password:", password);
  console.log("Hash:", hash);

  const isValid = await passwordUtils.verifyPassword(password, hash);
  console.log("Password verification result:", isValid);

  // Test with wrong password
  const wrongPassword = "WrongPassword";
  const isWrongValid = await passwordUtils.verifyPassword(wrongPassword, hash);
  console.log("Wrong password verification result:", isWrongValid);
}

testPassword().catch(console.error);
