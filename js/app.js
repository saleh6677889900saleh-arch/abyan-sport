/* =========================================================
   أبيان سبورت
   app.js

   الواجهة الرئيسية
   الإصدار الكامل
========================================================= */

"use strict";


/* =========================================================
   إعداد Supabase
========================================================= */

const SUPABASE_URL =
    "https://ujbgrwgxhusgoobhoanx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_oE8HsCGOsmRvIg0XwzymMA_I_33XlZ6";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   عناصر الصفحة
========================================================= */

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


/* =========================================================
   بيانات التطبيق
========================================================= */

let teams = [];

let matches = [];

let players = [];

let currentFilter = "all";


/* =========================================================
   القائمة في الجوال
========================================================= */

if (menuBtn && mainNav) {

    menuBtn.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle(
                "open"
            );

        }
    );

}


document.querySelectorAll(
    ".nav-link"
).forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            if (mainNav) {

                mainNav.classList.remove(
                    "open"
                );

            }

        }
    );

});


/* =========================================================
   فلاتر المباريات
========================================================= */

document.querySelectorAll(
    ".filter-btn"
).forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            document.querySelectorAll(
                ".filter-btn"
            ).forEach(function (btn) {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter ||
                "all";


            renderMatches();

        }
    );

});


/* =========================================================
   زر التحديث
========================================================= */

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


/* =========================================================
   تحميل جميع البيانات
========================================================= */

async function loadAllData() {

    setConnection(
        "loading"
    );


    try {

        /*
         * نحمل الفرق أولًا
         * ثم المباريات واللاعبين.
         */

        await loadTeams();

        await Promise.all([
            loadMatches(),
            loadPlayers()
        ]);


        updateStatistics();

        renderLiveMatches();

        renderMatches();

        renderTeams();

        renderPlayers();


        setConnection(
            "connected"
        );


    } catch (error) {

        console.error(
            "❌ خطأ تحميل البيانات:",
            error
        );


        setConnection(
            "error"
        );

    }

}


/* =========================================================
   تحميل الفرق
========================================================= */

async function loadTeams() {

    console.log(
        "⚽ جاري تحميل الفرق..."
    );


    const result =
        await supabaseClient
            .from("teams")
            .select("*")
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "❌ خطأ تحميل الفرق:",
            result.error
        );


        teams = [];

        return;

    }


    teams =
        Array.isArray(result.data)
            ? result.data
            : [];


    console.log(
        "⚽ عدد الفرق:",
        teams.length
    );

}


/* =========================================================
   تحميل المباريات
========================================================= */

async function loadMatches() {

    console.log(
        "🏆 جاري تحميل المباريات..."
    );


    const result =
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


    if (result.error) {

        console.error(
            "❌ خطأ تحميل المباريات:",
            result.error
        );


        matches = [];

        return;

    }


    matches =
        Array.isArray(result.data)
            ? result.data
            : [];


    console.log(
        "🏆 عدد المباريات:",
        matches.length
    );

}


/* =========================================================
   تحميل اللاعبين
========================================================= */

async function loadPlayers() {

    console.log(
        "👤 جاري تحميل اللاعبين..."
    );


    try {

        const result =
            await supabaseClient
                .from("players")
                .select("*");


        console.log(
            "📦 نتيجة استعلام players:",
            result
        );


        if (result.error) {

            console.error(
                "❌ خطأ تحميل اللاعبين:",
                result.error
            );


            players = [];

            return;

        }


        players =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "👤 عدد اللاعبين:",
            players.length
        );


        console.log(
            "👤 بيانات اللاعبين:",
            players
        );


    } catch (error) {

        console.error(
            "❌ خطأ غير متوقع في تحميل اللاعبين:",
            error
        );


        players = [];

    }

}


/* =========================================================
   الإحصائيات
========================================================= */

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
            live.length +
            " مباشر";

    }


    if (teamsCountBadge) {

        teamsCountBadge.textContent =
            teams.length +
            " فريق";

    }


    if (playersCountBadge) {

        playersCountBadge.textContent =
            players.length +
            " لاعب";

    }

}


/* =========================================================
   المباريات المباشرة
========================================================= */

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

                <p>
                    ستظهر المباراة هنا تلقائيًا
                    عند تحويل حالتها إلى "مباشرة".
                </p>

            </div>

        `;

        return;

    }


    liveMatchesContainer.innerHTML =
        live
            .map(
                createMatchCard
            )
            .join("");

}


/* =========================================================
   عرض المباريات
========================================================= */

function renderMatches() {

    if (!matchesList) {

        return;

    }


    let list = [
        ...matches
    ];


    if (
        currentFilter !==
        "all"
    ) {

        list =
            list.filter(
                function (match) {

                    return normalizeStatus(
                        match.status
                    ) ===
                    currentFilter;

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


            if (
                aLive !==
                bLive
            ) {

                return (
                    aLive -
                    bLive
                );

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

                <div style="font-size:45px;">
                    ⚽
                </div>

                <strong>
                    لا توجد مباريات
                </strong>

                <p>
                    لا توجد بيانات مطابقة للفترة المحددة.
                </p>

            </div>

        `;

        return;

    }


    matchesList.innerHTML =
        list
            .map(
                createMatchCard
            )
            .join("");

}


/* =========================================================
   مقارنة المباريات
========================================================= */

function compareMatches(
    a,
    b
) {

    const dateA =
        String(
            a.match_date || ""
        );


    const dateB =
        String(
            b.match_date || ""
        );


    if (
        dateA <
        dateB
    ) {

        return -1;

    }


    if (
        dateA >
        dateB
    ) {

        return 1;

    }


    const timeA =
        String(
            a.match_time || ""
        );


    const timeB =
        String(
            b.match_time || ""
        );


    return timeA.localeCompare(
        timeB
    );

}


/* =========================================================
   إنشاء بطاقة مباراة
========================================================= */

function createMatchCard(
    match
) {

    const home =
        getHomeTeamName(
            match
        );


    const away =
        getAwayTeamName(
            match
        );


    const status =
        normalizeStatus(
            match.status
        );


    const homeTeam =
        findTeam(
            home
        );


    const awayTeam =
        findTeam(
            away
        );


    const statusClass =
        getStatusClass(
            status
        );


    const score =
        getScore(
            match
        );


    const live =
        isLiveMatch(
            match
        );


    return `

        <article
            class="match-card"
            data-match-id="${escapeHTML(
                match.id || ""
            )}"
        >

            <div class="match-top">

                <div class="match-date">

                    ${formatDate(
                        match.match_date
                    )}

                    ${formatTime(
                        match.match_time
                    )}

                </div>


                <span
                    class="status ${statusClass}"
                >

                    ${
                        live
                            ? `
                                <span class="live-indicator">

                                    <span class="live-pulse"></span>

                                    مباشر

                                </span>
                              `
                            : escapeHTML(
                                status ||
                                "قادمة"
                              )
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

                        ${escapeHTML(
                            home
                        )}

                    </div>

                </div>


                <div>

                    <div
                        class="
                            match-score
                            ${
                                score.pending
                                    ? "pending"
                                    : ""
                            }
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

                        ${escapeHTML(
                            away
                        )}

                    </div>

                </div>

            </div>


            <div class="match-meta">

                📅
                ${formatDate(
                    match.match_date
                )}

                &nbsp; • &nbsp;

                🕐
                ${formatTime(
                    match.match_time
                )}

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


/* =========================================================
   النتيجة
========================================================= */

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

            html:
                "لم تبدأ"

        };

    }


    return {

        pending: false,

        html:
            escapeHTML(
                home
            ) +
            " - " +
            escapeHTML(
                away
            )

    };

}


/* =========================================================
   عرض الفرق
========================================================= */

function renderTeams() {

    if (!teamsGrid) {

        return;

    }


    if (teams.length === 0) {

        teamsGrid.innerHTML = `

            <div class="empty-card">

                ⚽

                <br>

                لا توجد فرق مسجلة حاليًا.

            </div>

        `;

        return;

    }


    teamsGrid.innerHTML =
        teams
            .map(
                createTeamCard
            )
            .join("");


    document.querySelectorAll(
        ".team-card"
    ).forEach(function (card) {

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

                    showTeamDetails(
                        team
                    );

                }

            }
        );

    });

}


/* =========================================================
   بطاقة الفريق
========================================================= */

function createTeamCard(
    team
) {

    const name =
        team.name ||
        "فريق غير معروف";


    return `

        <article
            class="team-card"
            data-id="${escapeHTML(
                team.id || ""
            )}"
        >

            <div class="team-card-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="شعار ${escapeHTML(
                                    name
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='block';
                                "
                            >

                            <span
                                style="display:none;"
                            >
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

                ${escapeHTML(
                    name
                )}

            </h3>


            <p>

                ${escapeHTML(
                    team.city ||
                    "أبين"
                )}

            </p>


            <div class="team-card-footer">

                عرض معلومات الفريق ←

            </div>

        </article>

    `;

}


/* =========================================================
   عرض اللاعبين
========================================================= */

function renderPlayers() {

    if (!playersGrid) {

        console.error(
            "❌ playersGrid غير موجود في index.html"
        );

        return;

    }


    console.log(
        "🎨 بدء عرض اللاعبين:",
        players
    );


    /*
     * مهم:
     *
     * لا نخفي اللاعب إلا إذا كانت
     * قيمة active أو is_active
     * تساوي false فعلًا.
     *
     * null / undefined / "" لا تخفي اللاعب.
     */

    const visiblePlayers =
        players.filter(
            function (player) {

                if (
                    player &&
                    player.active === false
                ) {

                    return false;

                }


                if (
                    player &&
                    player.is_active === false
                ) {

                    return false;

                }


                return true;

            }
        );


    console.log(
        "👤 عدد اللاعبين قبل العرض:",
        players.length
    );


    console.log(
        "👤 عدد اللاعبين بعد الفلترة:",
        visiblePlayers.length
    );


    if (
        visiblePlayers.length === 0
    ) {

        playersGrid.innerHTML = `

            <div class="empty-card">

               
