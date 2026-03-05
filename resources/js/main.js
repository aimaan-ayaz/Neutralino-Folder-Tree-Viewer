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

    element.addEventListener("click", async () => {

    if (container.style.display === "none") {

        container.style.display = "block";
        arrow.textContent = "▼ ";

    } else {

        container.style.display = "none";
        arrow.textContent = "▶ ";

    }

    const info = document.getElementById("folderInfo");

    const stats = await analyzeFolder(newPath);

    info.innerHTML = `
    <b>Files:</b>${stats.files}<br>
    Subfolders: ${stats.folders}<br>
    Total Size: ${(stats.totalSize/1024/1024).toFixed(2)} MB<br>
    Largest File: ${stats.largestFile}
    `;

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

async function analyzeFolder(path){

    let files = 0;
    let folders = 0;
    let totalSize = 0;
    let largestFile = "";
    let largestSize = 0;

    const items = await Neutralino.filesystem.readDirectory(path);

    for(let item of items){

        const fullPath = path + "/" + item.entry;

        if(item.type === "DIRECTORY"){
            folders++;

            const sub = await analyzeFolder(fullPath);

            files += sub.files;
            folders += sub.folders;
            totalSize += sub.totalSize;

            if(sub.largestSize > largestSize){
                largestSize = sub.largestSize;
                largestFile = sub.largestFile;
            }

        }
        else{

            files++;

            const stats = await Neutralino.filesystem.getStats(fullPath);

            totalSize += stats.size;

            if(stats.size > largestSize){
                largestSize = stats.size;
                largestFile = item.entry;
            }
        }
    }

    return {files, folders, totalSize, largestFile, largestSize};
}

Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});