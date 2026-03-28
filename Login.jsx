const login = async () => {
    try{
    const res = await fetch ("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify ({email, password }),
    })
    const data = await res.json();

    if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful");
    }else {
        alert("Login failed");
    }
} catch(err) {
    console.error(err);
    alert("Something went wrong");
}
};