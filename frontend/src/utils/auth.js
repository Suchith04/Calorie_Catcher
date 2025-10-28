

function isLoggedin(){
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined;
}

function logout(){
    localStorage.removeItem("token");
}

export {isLoggedin,logout};