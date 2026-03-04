Neutralino.init();

const pathInput = document.getElementById("path");
const loadBtn = document.getElementById("loadBtn");
const tree = document.getElementById("tree");

loadBtn.addEventListener("click", loadTree);

async function loadTree() {

    const path = pathInput.value;

    tree.innerHTML = "";

    try {

        await buildTree(path, tree);

    } catch (err) {

        tree.innerHTML = "❌ Invalid path or permission denied";

    }

}

async function buildTree(path, parent) {

    const items = await Neutralino.filesystem.readDirectory(path);

    for (let item of items) {

        const element = document.createElement("div");

        if (item.type === "DIRECTORY") {

    const arrow = document.createElement("span");
    arrow.textContent = "▼ ";
    arrow.style.cursor = "pointer";

    const name = document.createElement("span");
    name.textContent = "📁 " + item.entry;

    element.appendChild(arrow);
    element.appendChild(name);
    element.className = "folder";

    const container = document.createElement("div");
    container.className = "tree-children";
    container.style.marginLeft = "20px";

    parent.appendChild(element);
    parent.appendChild(container);

    const newPath = path + "/" + item.entry;

    await buildTree(newPath, container);

    element.addEventListener("click", () => {

        if (container.style.display === "none") {

            container.style.display = "block";
            arrow.textContent = "▼ ";

        } else {

            container.style.display = "none";
            arrow.textContent = "▶ ";

        }

    });

}

        else {

    const name = item.entry.toLowerCase();

    if (
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp")
    ) {
        element.textContent = "🖼️ " + item.entry;
    } 
    else {
        element.textContent = "📄 " + item.entry;
    }

    element.className = "file";

    parent.appendChild(element);

}
    }
}

Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});