let currentAudio = null;
let songs = [];
let songlst = [];
let idno = -1;
let audiotime;
let trackname;
let currfolder;

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`songs/${currfolder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    for (let item = 0; item < as.length; item++) {
        let element = as[item];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }

    return songs;
}

function formatesongname(name) {
    return name.replaceAll("%20", " ")
        .replace("320 Kbps.mp3", ".")
        .replace("128 Kbps", ".")
        .replace(".mp3", ".")
        .replace("- PaagalWorld.Com.Se", " Masoom Sharma ")
        .replace("_", " ");
}

async function updateUI(id) {
    let list = document.querySelectorAll(".listsong");
    for (let i = 0; i < list.length; i++) {
        let song = list[i].querySelector(".songname");
        let songplayimg = list[i].querySelector(".playbtnimg");

        if (song) song.style.animation = "none";
        if (songplayimg) songplayimg.src = "tool/playbar.svg";
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    let listitem = list[id];
    let song = listitem.querySelector(".songname");
    let imgplay = listitem.querySelector(".playbtnimg");

    idno = id;

    currentAudio = await track(idno);
    currentAudio.play();

    currentAudio.addEventListener("ended", () => {
        document.getElementById("play").src = "tool/playbar.svg";
    });

    trackname = formatesongname(songlst[idno]);

    if (song && imgplay) {
        song.style.animation = "textanime 10s linear infinite";
        document.querySelector(".playbar").style.display = "flex";
        imgplay.src = "tool/pause.svg";
        document.getElementById("play").src = "tool/pause.svg"
        document.querySelector(".songtext").innerHTML = trackname;
    }

    currentAudio.addEventListener("timeupdate", () => {
        let cur = currentAudio.currentTime;
        let dur = currentAudio.duration;

        let curMin = Math.floor(cur / 60);
        let curSec = String(Math.floor(cur % 60)).padStart(2, '0');
        let percentage = (cur / dur) * 100;
        let durMin = Math.floor(dur / 60);
        let durSec = String(Math.floor(dur % 60)).padStart(2, '0');

        document.querySelector(".songtime").innerText = `${curMin}:${curSec} / ${durMin}:${durSec}`;
        document.querySelector(".circle").style.left = `${percentage}%`;
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, Gray ${percentage}%, Black ${percentage}%)`;
    });

    activeItem = listitem;
}

async function track(trackid) {
    return new Audio(songs[trackid]);
}

async function main() {
    let foldercont = document.querySelector(".cardcont");

    let folderarray = await fetch("songs/"); // ✅ CHANGED
    let folderresponce = await folderarray.text();

    let foldiv = document.createElement("div");
    foldiv.innerHTML = folderresponce;

    let songfollst = [];
    let fas = foldiv.querySelectorAll("a");
    let lastcont = document.querySelector(".lastcont");

    for (let i = 0; i < fas.length; i++) {
        let folelement = fas[i];
        let href = folelement.getAttribute("href");

        if (!href || href === "../") continue;

        let decodedHref = decodeURIComponent(href);

        if (decodedHref.toLowerCase().endsWith("songs/")) {
            let folderName = decodedHref.slice(0, -1);
            songfollst.push(folderName.split("/songs/")[1]);
        }
    }

    for (let k = 0; k < songfollst.length; k++) {
        let cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.innerHTML = `
            <div class="cardimg">
                <img src="songs/${songfollst[k]}/img${k+1}.jpg" id="cardimgid" alt="card img">
                <div class="play">
                    <img src="tool/play.svg" class="playsvg" alt="card image">
                </div>
            </div>
            <span class="span1 spanbox">${songfollst[k]}</span>
        `;

        if (lastcont) {
            foldercont.insertBefore(cardDiv, lastcont);
        } else {
            foldercont.appendChild(cardDiv);
        }
    }

    let folder = document.querySelector(".cardcont");

    folder.addEventListener("click", async (e) => {
        let folderCard = e.target.closest(".card");

        if (folderCard) {
            let playbtn = folderCard.querySelector(".play");
            let span = folderCard.querySelector(".span1");

            if (span) {
                let folname = await span.innerText;

                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }

                songs = [];
                songlst = [];
                idno = -1;

                let allPlayBtns = document.querySelectorAll(".play");
                allPlayBtns.forEach((btn) => {
                    btn.removeAttribute("id");
                    let icon = btn.querySelector(".playsvg");
                    if (icon) icon.src = "tool/play.svg";
                });

                document.querySelector(".songslist ul").innerHTML = "";
                document.querySelector(".playbar").style.display = "none";

                songs = await getsongs(`${folname}`);

                for (const song of songs) {
                    songlst.push(song.split(`${encodeURIComponent(currfolder)}/`)[1]);
                }

                let doc = document.querySelector(".songslist ul");
                for (const i of songlst) {
                    doc.innerHTML += `
                    <li class="listsong" data-filename="${i}">
                        <img src="tool/music.svg" class="musicimg" alt="music image">
                        <div class="musicinfo">
                            <div class="songname">
                                <p class="tracknamep">${formatesongname(i)}</p>
                            </div>
                        </div>
                        <span>Play</span>
                        <img src="tool/playbar.svg" alt="play button image" class="playbtnimg">
                    </li>`;
                }

                if (playbtn) playbtn.id = "playafter";
            }
        }

        if (e.target.closest(".play")?.id === "playafter") {
            await updateUI(0);
            let icon = e.target.closest(".play").querySelector(".playsvg");
            if (icon) icon.src = "tool/pausebar.svg";
        }
    });

    let imgplaybtn = document.querySelector(".songslist");
    let activeItem = null;

    imgplaybtn.addEventListener("click", async (e) => {
        let listitem = e.target.closest(".listsong");

        if (listitem) {
            if (listitem === activeItem) {
                let song = listitem.querySelector(".songname");
                let imgplay = listitem.querySelector(".playbtnimg");
                if (song) song.style.animation = "none";
                if (imgplay) imgplay.src = "tool/playbar.svg";
                document.getElementById("play").src = "tool/playbar.svg";
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                activeItem = null;
                currentAudio = null;
                return;
            }

            let songid = listitem.getAttribute("data-filename");
            idno = songlst.indexOf(songid);

            if (idno !== -1) {
                await updateUI(idno);
            }
        }
    });

    let seek = document.querySelector(".seekbar");
    seek.addEventListener("click", (e) => {
        if (!currentAudio || !currentAudio.duration) return;
        const rect = seek.getBoundingClientRect();
        const clickx = e.clientX - rect.left;
        const width = seek.offsetWidth;
        const percentage = (clickx / width) * 100;

        currentAudio.currentTime = (percentage / 100) * currentAudio.duration;
        document.querySelector(".circle").style.left = `${percentage}%`;
    });

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
            play.src = "tool/pause.svg";
        } else {
            currentAudio.pause();
            play.src = "tool/playbar.svg";
        }
    });

    let pre = document.getElementById("previous");
    pre.addEventListener("click", async () => {
        if (idno > 0) {
            idno--;
            currentAudio.pause();
            await updateUI(idno);
        }
    });

    let next = document.getElementById("next");
    next.addEventListener("click", async () => {
        if (idno < (songlst.length - 1)) {
            idno++;
            currentAudio.pause();
            await updateUI(idno);
        }
    });
}

function clickleft() {
    let library = document.querySelector(".librarybtn");
    let left = document.querySelector(".left");
    let playlayout = document.querySelector(".playbar");
    library.addEventListener("click", (e) => {
        left.classList.add("active");
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (!left.contains(e.target) && !library.contains(e.target) && !playlayout.contains(e.target)) {
            left.classList.remove("active");
        }
    });

    document.querySelector(".createplaylist").addEventListener("click", () => {
        left.classList.remove("active");
    });

    let inputtxt = document.getElementById("inputtxt");
    inputtxt.addEventListener("input", () => {
        if (inputtxt.value !== "") {
            inputtxt.style.backgroundColor = "rgb(20,20,20)";
        }
    });

    let volumeslidebar = document.getElementById("vlmrange");
    volumeslidebar.addEventListener("input", () => {
        currentAudio.volume = volumeslidebar.value;
    });

    let volumeicon = document.getElementById("vlm");

    volumeicon.addEventListener("click", () => {
        if (volumeicon.src.includes("volume.svg")) {
            volumeicon.src = "tool/mute.svg";
            currentAudio.volume = 0;
        } else {
            volumeicon.src = "tool/volume.svg";
            currentAudio.volume = volumeslidebar.value;
        }
    });
}

main();
clickleft();