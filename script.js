document.addEventListener("DOMContentLoaded", () => {
    loadSavedRecipes();
});

document.getElementById("searchBtn").addEventListener("click", function() {
    let mealName = document.getElementById("searchInput").value.trim();

    if (mealName === "") {
        alert("Please enter a recipe name!");
        return;
    }

    fetch(`http://localhost:8080/api/recipes/search/${mealName}`)
        .then(response => {
            console.log("🔍 RAW Response:", response);

            if (!response.ok) {
                throw new Error(`❌ HTTP error! Status: ${response.status}`);
            }

            return response.json();  // دریافت داده به عنوان JSON
        })
        .then(data => {
            console.log("✅ JSON Response:", data);

            let mealResults = document.getElementById("mealResults");
            mealResults.innerHTML = "";

            if (data.meals) {
                let meal = data.meals[0];

                let mealDiv = document.createElement("div");
                mealDiv.innerHTML = `
                    <h3>${meal.strMeal}</h3>
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <p><strong>Category:</strong> ${meal.strCategory}</p>
                    <p>${meal.strInstructions.substring(0, 200)}...</p>
                    <button onclick="saveRecipe('${meal.idMeal}', '${meal.strMeal}', '${meal.strCategory}', '${meal.strInstructions.replace(/(\r\n|\n|\r)/gm, " ")}', '${meal.strMealThumb}')">
                        Save Recipe
                    </button>
                `;

                mealResults.appendChild(mealDiv);
            } else {
                mealResults.innerHTML = "<p>No meals found.</p>";
            }
        })
        .catch(error => {
            console.error("❌ Error fetching meal:", error);
            alert("❌ Error fetching meal: " + error.message);
        });
});

function saveRecipe(recipeId, recipeName, category, instructions, imageUrl) {
    fetch("http://localhost:8080/api/recipes/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            recipeId: recipeId,
            recipeName: recipeName,
            category: category,
            instructions: instructions,
            imageUrl: imageUrl
        })
    })
    .then(response => {
        console.log("RAW Response:", response);

        return response.text().then(text => {
            console.log("Response Text:", text);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
            }

            if (!text || text.trim() === "") {
                throw new Error("❌ Empty response from server! (Unexpected EOF)");
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error(`❌ Invalid JSON Response! Text received: ${text}`);
            }
        });
    })
    .then(data => {
        console.log("✅ JSON Response:", data);
        alert("Recipe saved successfully!");
        loadSavedRecipes();
    })
    .catch(error => {
        console.error("❌ Error saving recipe:", error);
        alert("❌ Error saving recipe: " + error.message);
    });
}

function loadSavedRecipes() {
    fetch("http://localhost:8080/api/recipes")
        .then(response => response.json())
        .then(data => {
            let savedRecipesList = document.getElementById("savedRecipes");
            savedRecipesList.innerHTML = "";

            if (data.length === 0) {
                savedRecipesList.innerHTML = "<p>No saved recipes.</p>";
                return;
            }

            data.forEach(recipe => {
                let li = document.createElement("li");
                li.innerHTML = `
                    ${recipe.recipeName} 
                    <button onclick="deleteRecipe(${recipe.id})">Delete</button>
                `;
                savedRecipesList.appendChild(li);
            });
        })
        .catch(error => console.error("Error loading saved recipes:", error));
}

function deleteRecipe(id) {
    fetch(`http://localhost:8080/api/recipes/${id}`, {
        method: "DELETE"
    })
    .then(response => response.text())
    .then(text => {
        console.log("Delete Response:", text);
        alert("Recipe deleted successfully!");
        loadSavedRecipes();
    })
    .catch(error => {
        console.error("Error deleting recipe:", error);
        alert("Error deleting recipe. Check console for details.");
    });
}