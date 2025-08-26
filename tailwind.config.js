module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Inclut tous les fichiers dans le dossier src
  ],
  safelist: [
    {
      pattern: /bg-(red|green|blue)-(100|200|300)/, // Ajoute des classes dynamiques spécifiques
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

