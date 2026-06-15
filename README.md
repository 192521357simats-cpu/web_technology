# Gourmet Haven Website

A beautiful, cinematic, and premium fine-dining restaurant website. Designed with responsive grids, micro-animations, parralax shifts, and a luxurious dark-gold color palette.

## Getting Started

All assets, styles, scripts, and pages are fully configured using **relative file paths**. This makes the project completely portable and ready for hosting on either a local server (like XAMPP) or any public domain (such as GitHub Pages or Netlify) without any configuration changes.

---

## 1. Hosting Locally with XAMPP

To run and test the website locally on your computer using XAMPP:

1. **Install XAMPP**: If you don't have it installed, download and install XAMPP from [Apache Friends](https://www.apachefriends.org/).
2. **Locate the htdocs folder**: Navigate to your XAMPP installation directory (typically `C:\xampp\htdocs\` on Windows).
3. **Copy the Project**: Copy the entire `web_tech` project directory into `htdocs`. Your path should look like:
   `C:\xampp\htdocs\web_tech\`
4. **Start Apache**:
   - Open the **XAMPP Control Panel**.
   - Click the **Start** button next to **Apache**.
5. **Open in Browser**: Open your web browser and navigate to:
   [http://localhost/web_tech/index.html](http://localhost/web_tech/index.html)

---

## 2. Deploying to a Public Domain

### Option A: GitHub Pages (Free)
Since this is a fully static website (HTML, CSS, JS), you can host it for free using GitHub Pages:
1. Initialize a Git repository in this folder (if not done already).
2. Create a new repository on GitHub and push your code there.
3. On GitHub, go to your repository's **Settings** tab.
4. Scroll down to **Pages** in the left sidebar.
5. Under **Build and deployment**, set the Source to **Deploy from a branch**.
6. Select your main branch (e.g., `main` or `master`) and folder (`/root`), and click **Save**.
7. Your site will be published at `https://<your-username>.github.io/<your-repo-name>/`.

### Option B: Netlify (Free & Easiest)
1. Go to [Netlify](https://www.netlify.com/) and log in/sign up.
2. Drag and drop the `web_tech` folder directly into the deployment upload box on the Netlify dashboard.
3. Your site will be live on a public domain immediately! You can configure custom domains in Netlify settings.

---

## Image Asset Details

The project has been configured to use the 12 custom high-quality image assets copied to `/images`:

* **`hero.png`**: Hero Background & Page Hero backgrounds.
* **`Wine.jpeg`**: Restaurant interior, Wine Table scene, Carousel image, and Dining highlights.
* **`Gourmet_dish.jpeg`**: Featured Signature Dish and Gallery item.
* **`Chef_plating.jpeg`**: Executive Chef plating scenes.
* **`Truffle_risotto.jpeg`**: Truffle Risotto starter item.
* **`filet_mignon.jpeg`**: Filet Mignon main course.
* **`Lobster_tail.jpeg`**: Lobster Tail starter/seafood dish.
* **`Grilled_steak.jpeg`**: Prime Ribeye steak main course.
* **`Chocolate.jpeg`**: Dark Chocolate Torte dessert.
* **`Dessert_assortment.jpeg`**: Dessert selection.
* **`Berry_panna_cotta.jpeg`**: Berry Panna Cotta dessert in menu and gallery.
* **`Restaurant_map.jpeg`**: Location map in Contact page.

---

## Interactive Features

### Billboard Caption Tickers
Captions at the bottom of the memory images (Home page) and gallery items (Gallery page) have been transformed into floating, moving marquee text lines styled in **Didot** font, simulating premium digital billboards. They glide smoothly from right to left, providing an engaging, high-end motion design experience.
