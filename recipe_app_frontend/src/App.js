import React, { useState, useEffect } from "react";
import "./App.css";

// ---------- Mock Backend (Replace with API integration as needed) ----------
const localStorageKey = "recipes";
function getStoredRecipes() {
  let fromStore = [];
  try {
    fromStore = JSON.parse(localStorage.getItem(localStorageKey));
    if (!Array.isArray(fromStore)) fromStore = [];
  } catch {
    fromStore = [];
  }
  // Demo Recipes
  if (!fromStore || fromStore.length === 0) {
    fromStore = [
      {
        id: 1,
        title: "Classic Spaghetti Carbonara",
        ingredients: ["spaghetti", "egg", "pancetta", "parmesan", "black pepper"],
        instructions: `1. Cook spaghetti. 2. Fry pancetta. 3. Mix eggs and cheese. 4. Combine spaghetti, pancetta, and egg-cheese mix off the heat. 5. Add pepper and serve.`,
        image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?h=400&w=700&auto=compress",
        tags: ["italian", "pasta"],
      },
      {
        id: 2,
        title: "Guacamole",
        ingredients: ["avocado", "lime", "onion", "tomato", "salt", "cilantro"],
        instructions: `1. Mash avocados. 2. Mix in lime juice, onion, tomato, and cilantro. 3. Season with salt.`,
        image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?h=400&w=700&auto=compress",
        tags: ["mexican", "vegan", "appetizer"],
      },
    ];
    localStorage.setItem(localStorageKey, JSON.stringify(fromStore));
  }
  return fromStore;
}
function setStoredRecipes(data) {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
}
// --------------------------------------------------------------------------

// PUBLIC_INTERFACE
function App() {
  // Top-level state for recipe list & current UI mode
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // recipe id
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "add"
  const [theme, setTheme] = useState("light");

  // Load recipes initially
  useEffect(() => {
    setRecipes(getStoredRecipes());
  }, []);

  // Update theme dynamically
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Public Interface: Theme Toggle
  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // Filter recipes by keyword or ingredient
  const filterRecipes = (data, q) => {
    if (!q) return data;
    const qlc = q.trim().toLowerCase();
    return data.filter(
      (r) =>
        r.title.toLowerCase().includes(qlc) ||
        r.ingredients.join(" ").toLowerCase().includes(qlc) ||
        (r.tags && r.tags.join(" ").toLowerCase().includes(qlc))
    );
  };

  // Handler for adding or editing a recipe
  // PUBLIC_INTERFACE
  const handleSaveRecipe = (recipeData) => {
    let newList;
    if (modalMode === "edit") {
      newList = recipes.map((r) => (r.id === recipeData.id ? recipeData : r));
    } else {
      const newId =
        Math.max(0, ...recipes.map((r) => Number(r.id) || 0)) + 1;
      newList = [{ ...recipeData, id: newId }, ...recipes];
    }
    setRecipes(newList);
    setStoredRecipes(newList);
    setModalMode(null);
    setSelected(null);
  };

  // PUBLIC_INTERFACE
  const handleDeleteRecipe = (id) => {
    if (window.confirm("Delete this recipe?")) {
      const newList = recipes.filter((r) => r.id !== id);
      setRecipes(newList);
      setStoredRecipes(newList);
      setModalMode(null);
      setSelected(null);
    }
  };

  // Modal openers
  const openViewModal = (id) => {
    setSelected(id);
    setModalMode("view");
  };
  const openEditModal = (id) => {
    setSelected(id);
    setModalMode("edit");
  };
  const openAddModal = () => {
    setSelected(null);
    setModalMode("add");
  };
  const closeModal = () => {
    setSelected(null);
    setModalMode(null);
  };

  // Prepare recipe data for modals
  const selectedRecipe =
    selected && recipes.find((r) => r.id === selected)
      ? recipes.find((r) => r.id === selected)
      : null;

  return (
    <div className="App" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <NavBar theme={theme} onThemeToggle={toggleTheme} />
      <main>
        <div className="top-bar">
          <h1 className="app-title">Recipe Explorer</h1>
          <button className="add-btn" onClick={openAddModal}>
            ＋ Add Recipe
          </button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
        <RecipeGrid
          recipes={filterRecipes(recipes, search)}
          onCardClick={openViewModal}
        />
      </main>
      {modalMode && (
        <Modal onClose={closeModal}>
          {modalMode === "view" && selectedRecipe && (
            <RecipeDetail
              recipe={selectedRecipe}
              onEdit={() => openEditModal(selectedRecipe.id)}
              onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
              onClose={closeModal}
            />
          )}
          {modalMode === "edit" && selectedRecipe && (
            <RecipeForm
              recipe={selectedRecipe}
              onSave={handleSaveRecipe}
              onCancel={closeModal}
            />
          )}
          {modalMode === "add" && (
            <RecipeForm
              recipe={null}
              onSave={handleSaveRecipe}
              onCancel={closeModal}
            />
          )}
        </Modal>
      )}
      <footer className="footer">
        <span>
          Recipe Explorer &copy; {new Date().getFullYear()} | Modern, Monochrome Theme
        </span>
      </footer>
    </div>
  );
}

// NavBar Component
function NavBar({ theme, onThemeToggle }) {
  return (
    <nav className="navbar">
      <div className="navbar-app">🍽️ Recipe Explorer</div>
      <button className="theme-btn" onClick={onThemeToggle}>
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </nav>
  );
}

// SearchBar Component
function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search recipes, ingredients, tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
}

// RecipeGrid Component
function RecipeGrid({ recipes, onCardClick }) {
  if (recipes.length === 0)
    return (
      <div className="empty-hint">
        No recipes found. Try adding a new recipe!
      </div>
    );
  return (
    <div className="recipe-grid">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onClick={() => onCardClick(r.id)} />
      ))}
    </div>
  );
}

// RecipeCard Component
function RecipeCard({ recipe, onClick }) {
  return (
    <div className="recipe-card" onClick={onClick} tabIndex={0} aria-label={recipe.title}>
      <img
        src={recipe.image}
        alt={recipe.title}
        className="recipe-thumb"
        loading="lazy"
        style={{background: "#eee"}}
        onError={(e) => {e.target.src = "https://via.placeholder.com/300x200.png?text=No+Image"}}
      />
      <div className="recipe-card-content">
        <h2 className="recipe-title">{recipe.title}</h2>
        <div className="ingredient-small">
          <span role="img" aria-label="ingredients">🧾</span>
          {recipe.ingredients && recipe.ingredients.join(", ")}
        </div>
        <div className="tag-list">
          {recipe.tags && recipe.tags.map((tag) => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ children, onClose }) {
  useEffect(() => {
    function escClose(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", escClose);
    return () => document.removeEventListener("keydown", escClose);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose} tabIndex={-1}>
      <div className="modal-content" onClick={e=>e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

// RecipeDetail Component
function RecipeDetail({ recipe, onEdit, onDelete, onClose }) {
  return (
    <div className="recipe-detail">
      <img
        src={recipe.image}
        alt={recipe.title}
        className="detail-image"
        onError={(e) => {e.target.src = "https://via.placeholder.com/300x150.png?text=No+Image"}}
      />
      <h2>{recipe.title}</h2>
      <div className="tag-list">
        {recipe.tags && recipe.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
      <h4>Ingredients:</h4>
      <ul>
        {recipe.ingredients.map((ing, idx) => (<li key={idx}>{ing}</li>))}
      </ul>
      <h4>Instructions:</h4>
      <pre className="instructions">
        {recipe.instructions}
      </pre>
      <div className="modal-actions">
        <button className="edit-btn" onClick={onEdit}>Edit</button>
        <button className="del-btn" onClick={onDelete}>Delete</button>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// RecipeForm Component
function RecipeForm({ recipe, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    recipe
      ? { ...recipe }
      : {
          title: "",
          ingredients: "",
          instructions: "",
          image: "",
          tags: "",
        }
  );
  const [error, setError] = useState(null);

  // Handle input changes
  const handleInput = (evt) => {
    const { name, value } = evt.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handler for save button
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.ingredients.trim()) return setError("At least one ingredient required");
    if (!form.instructions.trim()) return setError("Instructions required");
    onSave({
      ...recipe,
      ...form,
      ingredients: form.ingredients.split(',').map(s=>s.trim()).filter(Boolean),
      tags: form.tags
        ? form.tags.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
        : [],
      id: recipe?.id || undefined,
    });
  };

  return (
    <div className="recipe-form">
      <h2>{recipe ? "Edit Recipe" : "Add Recipe"}</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <label>
          Title:
          <input name="title" value={form.title} onChange={handleInput} required />
        </label>
        <label>
          Ingredients (comma separated):
          <input name="ingredients" value={Array.isArray(form.ingredients) ? form.ingredients.join(", ") : form.ingredients}
            onChange={handleInput} required />
        </label>
        <label>
          Instructions:
          <textarea name="instructions" value={form.instructions} onChange={handleInput} rows={4} required />
        </label>
        <label>
          Image URL:
          <input name="image" value={form.image} onChange={handleInput} placeholder="http://..." />
        </label>
        <label>
          Tags (comma separated):
          <input name="tags" value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
            onChange={handleInput} placeholder="dessert, quick, vegan..." />
        </label>
        <div className="modal-actions">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="close-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default App;
