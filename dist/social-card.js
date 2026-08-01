const cardClass = {
    "easy-cheese": "fresh-wheel",
    hallouminate: "signal-through-the-melt",
    cheeselord: "norse-cheese-lord",
};
export function generateSocialCard(options) {
    const { width, height } = options.dimensions;
    if (width <= 0 || height <= 0)
        throw new Error("social-card dimensions must be positive");
    return {
        width,
        height,
        html: `<!doctype html><html lang="en"><meta charset="utf-8"><link rel="stylesheet" href="./social-card.css"><main class="${cardClass[options.flavor]}" style="width:${width}px;height:${height}px"><p>Cheese Lord</p><h1>${options.title}</h1><p>${options.description}</p></main></html>`,
    };
}
