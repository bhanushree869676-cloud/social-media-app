
const API = "http://localhost:5000/api";

let token = localStorage.getItem("token") || "";

// SHOW DIFFERENT SECTIONS
function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}

function showLogin() {
    showSection("loginSection");
}

function showRegister() {
    showSection("registerSection");
}

function showHome() {
    if (!token) {
        showLogin();
        return;
    }

    showSection("homeSection");
    loadPosts();
}

// REGISTER USER
async function register() {
    try {
        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        alert("Registration successful! Please login.");
        showLogin();

    } catch (error) {
        alert(error.message);
    }
}

// LOGIN USER
async function login() {
    try {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        token = data.token;
        localStorage.setItem("token", token);

        alert("Login successful!");
        showHome();

    } catch (error) {
        alert(error.message);
    }
}

// CREATE POST
async function createPost() {
    try {
        const content = document.getElementById("postContent").value;
        const image = document.getElementById("postImage").value;

        const response = await fetch(`${API}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                content,
                image
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Post creation failed");
        }

        document.getElementById("postContent").value = "";
        document.getElementById("postImage").value = "";

        alert("Post published successfully!");
        loadPosts();

    } catch (error) {
        alert(error.message);
    }
}

// LOAD ALL POSTS

async function loadPosts() {
    try {
        const response = await fetch(`${API}/posts`);
        const posts = await response.json();

        const container = document.getElementById("postsContainer");
        container.innerHTML = "";

        for (const post of posts) {

            const card = document.createElement("div");
            card.className = "post-card";

            const username = document.createElement("h3");
            username.textContent = post.user?.username || "Unknown user";

            const content = document.createElement("p");
            content.textContent = post.content;

            card.append(username, content);

            const actions = document.createElement("div");
            actions.className = "post-actions";

            const like = document.createElement("button");
            like.textContent = `❤️ Like (${post.likes.length})`;
            like.onclick = () => likePost(post._id);

            const comment = document.createElement("button");
            comment.textContent = `💬 Comment (${post.comments.length})`;
            comment.onclick = () => addComment(post._id);

            actions.append(like, comment);
            card.appendChild(actions);

            // SHOW COMMENTS
            const commentsContainer = document.createElement("div");
            commentsContainer.className = "comments-list";

            const commentResponse = await fetch(
                `${API}/comments/${post._id}`
            );

            const comments = await commentResponse.json();

            comments.forEach(item => {
                const p = document.createElement("p");

                p.textContent =
                    `${item.user?.username || "User"}: ${item.text}`;

                commentsContainer.appendChild(p);
            });

            card.appendChild(commentsContainer);
            container.appendChild(card);
        }

    } catch (error) {
        console.error(error);
        alert("Could not load posts or comments");
    }
}


// LIKE POST
async function likePost(postId) {
    try {
        const response = await fetch(`${API}/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Like failed");
        }

        loadPosts();

    } catch (error) {
        alert(error.message);
    }
}

// ADD COMMENT
async function addComment(postId) {
    const text = prompt("Write your comment:");

    if (!text || !text.trim()) return;

    try {
        const response = await fetch(`${API}/comments/${postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Comment failed");
        }

        alert("Comment added successfully!");
        loadPosts();

    } catch (error) {
        alert(error.message);
    }
}

// SHOW PROFILE
async function showProfile() {
    try {
        const response = await fetch(`${API}/profile/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Profile loading failed");
        }

        const user = data.user;
        const details = document.getElementById("profileDetails");

        details.innerHTML = "";

        const name = document.createElement("h3");
        name.textContent = user.username;

        const email = document.createElement("p");
        email.textContent = user.email;

        const bio = document.createElement("p");
        bio.textContent = user.bio || "No bio available";

        const followers = document.createElement("p");
        followers.textContent = `Followers: ${user.followers.length}`;

        const following = document.createElement("p");
        following.textContent = `Following: ${user.following.length}`;

        details.append(name, email, bio, followers, following);

        showSection("profileSection");

    } catch (error) {
        alert(error.message);
    }
}

// LOGOUT
function logout() {
    token = "";
    localStorage.removeItem("token");

    showLogin();
}

// INITIAL PAGE
if (token) {
    showHome();
} else {
    showLogin();
}

// SHOW USERS PAGE
async function showUsers() {
    if (!token) {
        showLogin();
        return;
    }

    showSection("usersSection");

    try {
        const response = await fetch(`${API}/users`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const users = await response.json();

        if (!response.ok) {
            throw new Error(users.message || "Unable to load users");
        }

        const container = document.getElementById("usersContainer");
        container.innerHTML = "";

        users.forEach(user => {
            const card = document.createElement("div");
            card.className = "post-card";

            const name = document.createElement("h3");
            name.textContent = user.username;

            const bio = document.createElement("p");
            bio.textContent = user.bio || "No bio available";

            const followers = document.createElement("p");
            followers.textContent =
                `Followers: ${user.followers.length}`;

            const button = document.createElement("button");

            const isFollowing = user.followers.some(
                id => String(id) === String(
                    JSON.parse(atob(token.split(".")[1])).id
                )
            );

            button.textContent = isFollowing ? "Unfollow" : "Follow";

            button.onclick = async () => {
                await followUser(user._id);
                showUsers();
            };

            button.style.background = "#1877f2";
            button.style.color = "white";
            button.style.border = "none";
            button.style.padding = "10px 20px";
            button.style.borderRadius = "8px";

            card.append(name, bio, followers, button);
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// FOLLOW OR UNFOLLOW USER
async function followUser(userId) {
    try {
        const response = await fetch(`${API}/follow/${userId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Follow failed");
        }

        alert(data.message);

    } catch (error) {
        alert(error.message);
    }
}
