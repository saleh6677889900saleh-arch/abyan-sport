"use strict";

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://ujbgrwgxhusgoobhoanx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oE8HsCGOsmRvIg0XwzymMA_I_33XlZ6";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   العناصر
===================================================== */

const connectionStatus =
    document.getElementById("connectionStatus");

const totalMatches =
    document.getElementById("totalMatches");

const liveMatchesCount =
    document.getElementById("liveMatches");

const totalTeams =
    document.getElementById("totalTeams");

const totalPlayers =
    document.getElementById("totalPlayers");

const liveMatchesContainer =
    document.getElementById("liveMatches");

const matchesList =
    document.getElementById("matchesList");

const teamsGrid =
    document.getElementById("teamsGrid");

const playersGrid =
    document.getElementById("playersGrid");

const liveCountBadge =
    document.getElementById("liveCountBadge");

const teamsCountBadge =
    document.getElementById("teamsCountBadge");

const playersCountBadge =
    document.getElementById("playersCountBadge");

const refreshBtn =
    document.getElementById("refreshBtn");

const menuBtn =
    document.getElementById("menuBtn");

const mainNav =
    document.getElementById("mainNav");

const detailsModal =
    document.getElementById("detailsModal");

const modalContent =
    document.getElementById("modalContent");

const closeModalBtn =
    document.getElementById("closeModalBtn");


/* =====================================================
   البيانات
===================================================== */

let teams = [];
let matches = [];
let players = [];

let currentFilter = "all";


/* =====================================================
   القائمة
===================================================== */

if (menuBtn && mainNav) {

    menuBtn.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle("open");

        }
    );

}


document.querySelectorAll(".nav-link")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (mainNav) {
                    mainNav.classList.remove("open");
                }

            }
        );

    });


/* =====================================================
   الفلاتر
===================================================== */

document.querySelectorAll(".filter-btn")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                document.querySelectorAll(".filter-btn")
                    .forEach(function (btn) {

                        btn.classList.remove("active");

                    });

                button.classList.add("active");

                currentFilter =
                    button.dataset.filter || "all";

                renderMatches();

            }
        );

    });


/* =====================================================
   زر التحديث
===================================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled = true;

            refreshBtn.textContent =
                "⏳ جاري التحديث...";

            await loadAllData();

            refreshBtn.disabled = false;

            refreshBtn.textContent =
                "🔄 تحديث";

        }
    );

}


/* =====================================================
   تحميل كل البيانات
===================================================== */

async function loadAllData() {

    setConnection("loading");

    console.log(
        "===================================="
    );

    console.log(
        "أبيان سبورت - بدء تحميل البيانات"
    );

    console.log(
        "===================================="
    );


    await loadTeams();

    await loadMatches();

    await loadPlayers();


    updateStatistics();

    renderLiveMatches();

    renderMatches();

    renderTeams();

    renderPlayers();


    setConnection("connected");


    console.log(
        "الفرق:",
        teams
    );

    console.log(
        "المباريات:",
        matches
    );

    console.log(
        "اللاعبون:",
        players
    );

}


/* =====================================================
   تحميل الفرق
===================================================== */

async function loadTeams() {

    console.log(
        "جاري طلب جدول teams..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("teams")
            .select("*");


    console.log(
        "نتيجة teams:",
        {
            data,
            error
        }
    );


    if (error) {

        console.error(
            "❌ خطأ teams"
        );

        console.error(
            "code:",
            error.code
        );

        console.error(
            "message:",
            error.message
        );

        console.error(
            "details:",
            error.details
        );

        console.error(
            "hint:",
            error.hint
        );


        teams = [];

        showDatabaseError(
            teamsGrid,
            "teams",
            error
        );

        return;

    }


    teams =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "✅ عدد الفرق:",
        teams.length
    );

}


/* =====================================================
   تحميل المباريات
===================================================== */

async function loadMatches() {

    console.log(
        "جاري طلب جدول matches..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("matches")
            .select("*")
            .order(
                "match_date",
                {
                    ascending: true
                }
            )
            .order(
                "match_time",
                {
                    ascending: true
                }
            );


    console.log(
        "نتيجة matches:",
        {
            data,
            error
        }
    );


    if (error) {

        console.error(
            "❌ خطأ matches:",
            error
        );

        matches = [];

        showDatabaseError(
            matchesList,
            "matches",
            error
        );

        return;

    }


    matches =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "✅ عدد المباريات:",
        matches.length
    );

}


/* =====================================================
   تحميل اللاعبين
===================================================== */

async function loadPlayers() {

    console.log(
        "جاري طلب جدول players..."
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("players")
            .select("*");


    console.log(
        "نتيجة players:",
        {
            data,
            error
        }
    );


    if (error) {

        console.error(
            "❌ خطأ players"
        );

        console.error(
            "code:",
            error.code
        );

        console.error(
            "message:",
            error.message
        );

        console.error(
            "details:",
            error.details
        );

        console.error(
            "hint:",
            error.hint
        );


        players = [];

        showDatabaseError(
            playersGrid,
            "players",
            error
        );

        return;

    }


    players =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "✅ عدد اللاعبين:",
        players.length
    );

}


/* =====================================================
   عرض خطأ قاعدة البيانات
===================================================== */

function showDatabaseError(
    element,
    table,
    error
) {

    if (!element) {
        return;
    }


    element.innerHTML = `

        <div class="empty-card">

            <div style="font-size:40px;">
                ❌
            </div>

            <strong>
                تعذر تحميل جدول ${escapeHTML(table)}
            </strong>

            <p>
                ${escapeHTML(
                    error?.message ||
                    "خطأ غير معروف"
                )}
            </p>

            ${
                error?.code
                    ? `
                        <small>
                            Code:
                            ${escapeHTML(error.code)}
                        </small>
                      `
                    : ""
            }

        </div>

    `;

}


/* =====================================================
   الإحصائيات
===================================================== */

function updateStatistics() {

    const live =
        matches.filter(
            isLiveMatch
        );


    if (totalMatches) {
        totalMatches.textContent =
            matches.length;
    }


    if (liveMatchesCount) {
        liveMatchesCount.textContent =
            live.length;
    }


    if (totalTeams) {
        totalTeams.textContent =
            teams.length;
    }


    if (totalPlayers) {
        totalPlayers.textContent =
            players.length;
    }


    if (liveCountBadge) {
        liveCountBadge.textContent =
            live.length + " مباشر";
    }


    if (teamsCountBadge) {
        teamsCountBadge.textContent =
            teams.length + " فريق";
    }


    if (playersCountBadge) {
        playersCountBadge.textContent =
            players.length + " لاعب";
    }

}


/* =====================================================
   المباريات المباشرة
===================================================== */

function renderLiveMatches() {

    if (!liveMatchesContainer) {
        return;
    }


    const live =
        matches.filter(
            isLiveMatch
        );


    if (live.length === 0) {

        liveMatchesContainer.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
                    💤
                </div>

                <strong>
                    لا توجد مباريات مباشرة الآن
                </strong>

            </div>

        `;

        return;

    }


    liveMatchesContainer.innerHTML =
        live
            .map(createMatchCard)
            .join("");

}


/* =====================================================
   المباريات
===================================================== */

function renderMatches() {

    if (!matchesList) {
        return;
    }


    let list = [
        ...matches
    ];


    if (
        currentFilter !== "all"
    ) {

        list =
            list.filter(
                function (match) {

                    return (
                        normalizeStatus(
                            match.status
                        ) ===
                        currentFilter
                    );

                }
            );

    }


    list.sort(
        function (a, b) {

            const aLive =
                isLiveMatch(a)
                    ? 0
                    : 1;

            const bLive =
                isLiveMatch(b)
                    ? 0
                    : 1;


            if (aLive !== bLive) {
                return aLive - bLive;
            }


            return compareMatches(
                a,
                b
            );

        }
    );


    if (list.length === 0) {

        matchesList.innerHTML = `

            <div class="empty-card">

                ⚽

                <br>

                لا توجد مباريات

            </div>

        `;

        return;

    }


    matchesList.innerHTML =
        list
            .map(createMatchCard)
            .join("");

}


/* =====================================================
   بطاقة المباراة
===================================================== */

function createMatchCard(
    match
) {

    const home =
        getHomeTeamName(match);

    const away =
        getAwayTeamName(match);

    const status =
        normalizeStatus(match.status);

    const homeTeam =
        findTeam(home);

    const awayTeam =
        findTeam(away);

    const score =
        getScore(match);

    const live =
        isLiveMatch(match);


    return `

        <article class="match-card">

            <div class="match-top">

                <div class="match-date">

                    ${formatDate(
                        match.match_date
                    )}

                    -

                    ${formatTime(
                        match.match_time
                    )}

                </div>


                <span
                    class="status
                    ${getStatusClass(status)}"
                >

                    ${
                        live
                            ? "🔴 مباشر"
                            : escapeHTML(status)
                    }

                </span>

            </div>


            <div class="match-teams">

                <div class="match-team">

                    ${createLogo(
                        homeTeam,
                        home
                    )}

                    <div class="match-team-name">

                        ${escapeHTML(home)}

                    </div>

                </div>


                <div>

                    <div
                        class="
                            match-score
                            ${score.pending ? "pending" : ""}
                        "
                    >

                        ${score.html}

                    </div>

                </div>


                <div class="match-team">

                    ${createLogo(
                        awayTeam,
                        away
                    )}

                    <div class="match-team-name">

                        ${escapeHTML(away)}

                    </div>

                </div>

            </div>


            <div class="match-meta">

                📅
                ${formatDate(match.match_date)}

                &nbsp; • &nbsp;

                🕐
                ${formatTime(match.match_time)}

                <br>

                🏟️
                ${escapeHTML(
                    match.stadium ||
                    "الملعب غير محدد"
                )}

            </div>

        </article>

    `;

}


/* =====================================================
   الفرق
===================================================== */

function renderTeams() {

    if (!teamsGrid) {
        return;
    }


    if (teams.length === 0) {

        teamsGrid.innerHTML = `

            <div class="empty-card">

                <div style="font-size:45px;">
                    ⚽
                </div>

                <strong>
                    لا توجد فرق
                </strong>

                <p>
                    لم يتم العثور على فرق في قاعدة البيانات.
                </p>

            </div>

        `;

        return;

    }


    teamsGrid.innerHTML =
        teams
            .map(createTeamCard)
            .join("");


    document.querySelectorAll(".team-card")
        .forEach(function (card) {

            card.addEventListener(
                "click",
                function () {

                    const id =
                        card.dataset.id;


                    const team =
                        teams.find(
                            function (item) {

                                return String(
                                    item.id
                                ) ===
                                String(id);

                            }
                        );


                    if (team) {
                        showTeamDetails(team);
                    }

                }
            );

        });

}


/* =====================================================
   بطاقة الفريق
===================================================== */

function createTeamCard(
    team
) {

    const name =
        team.name ||
        "فريق";


    return `

        <article
            class="team-card"
            data-id="${escapeHTML(team.id || "")}"
        >

            <div class="team-card-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(team.logo_url)}"
                                alt="شعار ${escapeHTML(name)}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='block';
                                "
                            >

                            <span style="display:none;">
                                ⚽
                            </span>
                          `
                        : `
                            <span>
                                ⚽
                            </span>
                          `
                }

            </div>


            <h3>

                ${escapeHTML(name)}

            </h3>


            <p>

                ${escapeHTML(
                    team.city || "أبين"
                )}

            </p>


            <div class="team-card-footer">

                عرض معلومات الفريق ←

            </div>

        </article>

    `;

}


/* =====================================================
   اللاعبون
===================================================== */

function renderPlayers() {

    if (!playersGrid) {
        return;
    }


    if (players.length === 0) {

        playersGrid.innerHTML = `

            <div class="empty-card">

                <div style="font-size:45px;">
                    👤
                </div>

                <strong>
                    لا يوجد لاعبون
                </strong>

                <p>
                    لم يتم العثور على لاعبين في قاعدة البيانات.
                </p>

            </div>

        `;

        return;

    }


    const visiblePlayers =
        players.filter(
            function (player) {

                /*
                 * لا نخفي اللاعب إلا إذا
                 * كان active موجودًا وقيمته false
                 */

                if (
                    player.active === false
                ) {
                    return false;
                }


                if (
                    player.is_active === false
                ) {
                    return false;
                }


                return true;

            }
        );


    playersGrid.innerHTML =
        visiblePlayers
            .map(createPlayerCard)
            .join("");


    document.querySelectorAll(".player-card")
        .forEach(function (card) {

            card.addEventListener(
                "click",
                function () {

                    const id =
                        card.dataset.id;


                    const player =
                        players.find(
                            function (item) {

                                return String(
                                    item.id
                                ) ===
                                String(id);

                            }
                        );


                    if (player) {
                        showPlayerDetails(player);
                    }

                }
            );

        });

}


/* =====================================================
   بطاقة اللاعب
===================================================== */

function createPlayerCard(
    player
) {

    const teamName =
        getPlayerTeamName(player);


    const position =
        player.position ||
        "لاعب";


    const number =
        getValue(
            player,
            [
                "number",
                "player_number",
                "shirt_number"
            ]
        );


    const photo =
        getPlayerPhoto(player);


    return `

        <article
            class="player-card"
            data-id="${escapeHTML(player.id || "")}"
        >

            <div class="player-photo">

                ${
                    photo
                        ? `
                            <img
                                src="${safeImageUrl(photo)}"
                                alt="${escapeHTML(
                                    player.name || "اللاعب"
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='block';
                                "
                            >

                            <span
                                class="player-placeholder"
                                style="display:none;"
                            >
                                👤
                            </span>
                          `
                        : `
                            <span class="player-placeholder">
                                👤
                            </span>
                          `
                }

            </div>


            <div class="player-body">

                <h3>

                    ${escapeHTML(
                        player.name || "لاعب"
                    )}

                </h3>


                <div class="player-team">

                    ⚽
                    ${escapeHTML(teamName)}

                </div>


                <div class="player-details">

                    <span class="player-tag">

                        ${escapeHTML(position)}

                    </span>


                    ${
                        number !== null &&
                        number !== undefined &&
                        number !== ""
                            ? `
                                <span class="player-tag">

                                    رقم ${escapeHTML(number)}

                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}


/* =====================================================
   تفاصيل الفريق
===================================================== */

function showTeamDetails(
    team
) {

    if (!modalContent) {
        return;
    }


    const teamPlayers =
        players.filter(
            function (player) {

                return (
                    getPlayerTeamName(player) ===
                    String(team.name || "")
                );

            }
        );


    modalContent.innerHTML = `

        <div class="modal-team-head">

            <div class="modal-big-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(team.logo_url)}"
                                alt="${escapeHTML(team.name || "فريق")}"
                            >
                          `
                        : `
                            ⚽
                          `
                }

            </div>


            <h2>

                ${escapeHTML(
                    team.name || "فريق"
                )}

            </h2>


            <div class="modal-muted">

                ${escapeHTML(
                    team.city || "أبين"
                )}

            </div>

        </div>


        <div class="modal-info-grid">

            <div class="modal-info-item">

                <strong>المدرب</strong>

                <span>
                    ${escapeHTML(
                        team.coach || "غير محدد"
                    )}
                </span>

            </div>


            <div class="modal-info-item">

                <strong>سنة التأسيس</strong>

                <span>
                    ${escapeHTML(
                        team.founded_year || "غير محددة"
                    )}
                </span>

            </div>


            <div class="modal-info-item">

                <strong>عدد اللاعبين</strong>

                <span>
                    ${teamPlayers.length}
                </span>

            </div>

        </div>


        ${
            team.description
                ? `
                    <div style="margin-top:20px;">

                        <strong>
                            نبذة
                        </strong>

                        <p>
                            ${escapeHTML(
                                team.description
                            )}
                        </p>

                    </div>
                  `
                : ""
        }

    `;


    openModal();

}


/* =====================================================
   تفاصيل اللاعب
===================================================== */

function showPlayerDetails(
    player
) {

    if (!modalContent) {
        return;
    }


    const teamName =
        getPlayerTeamName(player);


    const photo =
        getPlayerPhoto(player);


    modalContent.innerHTML = `

        <div class="modal-player-head">

            <div class="modal-big-logo">

                ${
                    photo
                        ? `
                            <img
                                src="${safeImageUrl(photo)}"
                                alt="${escapeHTML(
                                    player.name || "اللاعب"
                                )}"
                            >
                          `
                        : `
                            👤
                          `
                }

            </div>


            <h2>

                ${escapeHTML(
                    player.name || "اللاعب"
                )}

            </h2>


            <div class="modal-muted">

                ⚽
                ${escapeHTML(teamName)}

            </div>

        </div>


        <div class="modal-info-grid">

            <div class="modal-info-item">

                <strong>المركز</strong>

                <span>
                    ${escapeHTML(
                        player.position || "غير محدد"
                    )}
                </span>

            </div>


            <div class="modal-info-item">

                <strong>رقم القميص</strong>

                <span>
                    ${escapeHTML(
                        getValue(
                            player,
                            [
                                "number",
                                "player_number",
                                "shirt_number"
                            ]
                        ) || "غير محدد"
                    )}
                </span>

            </div>


            <div class="modal-info-item">

                <strong>تاريخ الميلاد</strong>

                <span>
                    ${formatDate(
                        player.birth_date
                    )}
                </span>

            </div>


            <div class="modal-info-item">

                <strong>الجنسية</strong>

                <span>
                    ${escapeHTML(
                        player.nationality ||
                        "غير محددة"
                    )}
                </span>

            </div>

        </div>


        ${
            player.bio
                ? `
                    <div style="margin-top:20px;">

                        <strong>
                            نبذة عن اللاعب
                        </strong>

                        <p>
                            ${escapeHTML(player.bio)}
                        </p>

                    </div>
                  `
                : ""
        }

    `;


    openModal();

}


/* =====================================================
   Modal
===================================================== */

function openModal() {

    if (!detailsModal) {
        return;
    }


    detailsModal.classList.remove("hidden");

    detailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal() {

    if (!detailsModal) {
        return;
    }


    detailsModal.classList.add("hidden");

    detailsModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

}


const modalOverlay =
    document.querySelector(".modal-overlay");


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeModal
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   الأدوات
===================================================== */

function findTeam(
    teamName
) {

    const normalized =
        normalizeName(teamName);


    return teams.find(
        function (team) {

            return (
                normalizeName(team.name) ===
                normalized
            );

        }
    ) || null;

}


function getHomeTeamName(
    match
) {

    return (
        match.home_team ||
        match.homeTeam ||
        match.home_team_name ||
        "الفريق المضيف"
    );

}


function getAwayTeamName(
    match
) {

    return (
        match.away_team ||
        match.awayTeam ||
        match.away_team_name ||
        "الفريق الضيف"
    );

}


function getPlayerTeamName(
    player
) {

    if (player.team_name) {
        return player.team_name;
    }


    if (player.team) {

        if (
            typeof player.team === "object"
        ) {

            return (
                player.team.name ||
                "غير محدد"
            );

        }

        return player.team;

    }


    if (player.team_id) {

        const team =
            teams.find(
                function (item) {

                    return String(item.id) ===
                        String(player.team_id);

                }
            );


        return team
            ? team.name
            : "غير محدد";

    }


    return "غير محدد";

}


function getPlayerPhoto(
    player
) {

    return (
        player.photo_url ||
        player.photo ||
        player.image_url ||
        player.image ||
        ""
    );

}


function createLogo(
    team,
    name
) {

    if (
        team &&
        team.logo_url
    ) {

        return `

            <div class="team-logo">

                <img
                    src="${safeImageUrl(team.logo_url)}"
                    alt="شعار ${escapeHTML(name)}"
                    loading="lazy"
                >

            </div>

        `;

    }


    return `

        <div class="team-logo">

            ⚽

        </div>

    `;

}


function getScore(
    match
) {

    const home =
        getValue(
            match,
            [
                "home_score",
                "homeScore",
                "home_goals"
            ]
        );


    const away =
        getValue(
            match,
            [
                "away_score",
                "awayScore",
                "away_goals"
            ]
        );


    if (
        home === null ||
        home === undefined ||
        home === "" ||
        away === null ||
        away === undefined ||
        away === ""
    ) {

        return {
            pending: true,
            html: "لم تبدأ"
        };

    }


    return {
        pending: false,
        html:
            escapeHTML(home) +
            " - " +
            escapeHTML(away)
    };

}


function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        ).trim();


    if (
        value.toLowerCase() === "live" ||
        value === "مباشرة"
    ) {
        return "مباشرة";
    }


    if (
        value.toLowerCase() === "finished" ||
        value === "انتهت"
    ) {
        return "انتهت";
    }


    if (
        value.toLowerCase() === "upcoming" ||
        value === "قادمة"
    ) {
        return "قادمة";
    }


    return value || "قادمة";

}


function isLiveMatch(
    match
) {

    return (
        normalizeStatus(match.status) ===
        "مباشرة"
    );

}


function getStatusClass(
    status
) {

    if (status === "مباشرة") {
        return "status-live";
    }


    if (status === "انتهت") {
        return "status-finished";
    }


    if (status === "قادمة") {
        return "status-upcoming";
    }


    return "";

}


function compareMatches(
    a,
    b
) {

    const dateA =
        String(a.match_date || "");

    const dateB =
        String(b.match_date || "");


    if (dateA < dateB) {
        return -1;
    }


    if (dateA > dateB) {
        return 1;
    }


    return String(
        a.match_time || ""
    ).localeCompare(
        String(
            b.match_time || ""
        )
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "غير محدد";
    }


    const text =
        String(value);


    const parts =
        text.split("-");


    if (parts.length === 3) {

        return (
            parts[2] +
            "-" +
            parts[1] +
            "-" +
            parts[0]
        );

    }


    return text;

}


function formatTime(
    value
) {

    if (!value) {
        return "غير محدد";
    }


    const text =
        String(value);


    return text.length >= 5
        ? text.substring(0, 5)
        : text;

}


function getValue(
    object,
    keys
) {

    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        const key =
            keys[i];


        if (
            object &&
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            return object[key];

        }

    }


    return null;

}


function normalizeName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function safeImageUrl(
    value
) {

    const url =
        String(
            value || ""
        ).trim();


    if (
        /^https?:\/\//i.test(url)
    ) {

        return escapeHTML(url);

    }


    return "";

}


/* =====================================================
   الاتصال
===================================================== */

function setConnection(
    state
) {

    if (!connectionStatus) {
        return;
    }


    if (state === "connected") {

        connectionStatus.innerHTML = `

            <span class="connection-dot"></span>

            متصل بقاعدة البيانات

        `;

        return;

    }


    if (state === "error") {

        connectionStatus.innerHTML = `

            <span
                class="connection-dot"
                style="background:#dc2626;"
            ></span>

            تعذر الاتصال بقاعدة البيانات

        `;

        return;

    }


    connectionStatus.innerHTML = `

        <span
            class="connection-dot"
            style="background:#f59e0b;"
        ></span>

        جاري الاتصال بقاعدة البيانات...

    `;

}


/* =====================================================
   التشغيل
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAllData();

    }
);


/* =====================================================
   تحديث كل 10 ثواني
===================================================== */

setInterval(
    loadAllData,
    10000
);
