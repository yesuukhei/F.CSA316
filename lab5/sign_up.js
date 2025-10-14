const crypto = require("crypto");

function signUp(users, { name, email, password }) {
  // 1. Basic checks
    if (!email.includes("@")) {
        console.log("❌ Invalid email");
    return;
  }
  if (!password || password.length < 8) {
    console.log("❌ Password too short");
    return;
  }
  if (!name || name.trim() === "") {
    console.log("❌ Enter your name");
    return;
  }

  // 2. Check if email already used
  const alreadyUsed = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (alreadyUsed) {
    console.log("❌ Email already registered");
    return;
  }


//   Яагаад хэрэгтэй вэ:

//   Salt байхгүй бол ижил нууц үгтэй хүмүүсийн hash ижил гарна 😬
  
//   Salt байвал бүгдийн hash өөр гарна 😎
  
//   Hacker hash-ийг таахад маш хэцүү болдог 🔐

  // 3. Make salt + hash password
//   hash hiisner ugugdliin sand nevtesench nuuts ug harah bolomjgu
// (нууц үг бүр дээр санамсаргүй тэмдэгт нэмдэг.
//) salt neg ijil nuuts ugtei hereglegcid ch uur2 hashtai bolno
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.createHmac("sha256", salt).update(password).digest("hex");

  // 4. Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  // 5. Save user
  users.push(newUser);


  // 6. Return safe info
  console.log("✅ Sign up successful!");
  return { id: newUser.id, name, email };
}

function login(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) {
        console.log("❌ User not found");
        return;
    }
  
    // hash input password with stored salt
    const hash = crypto.createHmac("sha256", user.salt)
                       .update(password)
                       .digest("hex");
  
    if (hash === user.passwordHash) {
      console.log("✅ Login successful! Welcome", user.name);
      return true;
    } else {
      console.log("❌ Wrong password!");
      return false;
    }
  }
  
if (require.main === module) {
  const users = [];
  signUp(users, { name: "yesuukhei", email: "yesuukhei1028@gmail.com", password: "Yesuu@28" });
  login("yesuukhei1028@gmail.com", "Yesuu@28");
}

module.exports = { signUp };
