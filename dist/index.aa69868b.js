(function() {
    /**
     * DOM object
     */ const DOM = {};
    /**
     * Leaflet map object
     */ let map = null;
    /**
     * Species object
     */ const species = [];
    /**
     * Data species
     */ let dataSpecies = "all";
    /**
     * Leaflet map options
     */ const mapOptions = {
        center: [
            38.7223,
            -9.1393
        ],
        zoom: 7,
        maxZoom: 16,
        minZoom: 7
    };
    const mapCorners = {
        1: L.latLng(45.00, -7),
        2: L.latLng(35.00, -11)
    };
    /**
     * Data
     */ let data = null;
    /**
     * Menu pbject
     */ const menu = {
        dashboard: {
            title: "Dashboard",
            icon: "fa-solid fa-gauge-high",
            path: "/dashboard"
        },
        map: {
            title: "Map",
            icon: "fa-solid fa-location-dot",
            path: "/map"
        },
        observations: {
            title: "Observations",
            icon: "fa-solid fa-table-list",
            path: "/observations"
        }
    };
    /**
     * Stats object
     */ const stats = {
        totalObservations: 0,
        species: {},
        totalSpecies: 0,
        totalGroupSize: 0,
        avgGroupSize: 0
    };
    /**
     * Caches DOM elements
     */ const cacheDOM = ()=>{
        DOM.loadingSpinner = document.getElementById("loading");
        DOM.navList = document.getElementById("navList");
        DOM.appHeader = document.getElementById("appHeader");
        DOM.appBody = document.getElementById("appBody");
        DOM.appFooter = document.getElementById("appFooter");
    };
    /**
     * View elements
     */ const view = {
        appTitle: ()=>{
            const title = document.createElement("H2");
            title.className = "app_title";
            title.textContent = "GPS Plots";
            return title;
        },
        viewTitle: (txt)=>{
            const title = document.createElement("H2");
            title.className = "view__title";
            title.textContent = txt;
            return title;
        },
        welcome: (user)=>{
            const welcome = document.createElement("DIV");
            let _user = user ?? "Pedro";
            welcome.className = "app_welcome";
            welcome.textContent = `Welcome, ${_user}`;
            return welcome;
        },
        statsCard: (title, value, variation, icon)=>{
            const _card = document.createElement("DIV");
            const _title = document.createElement("H3");
            const _value = document.createElement("SPAN");
            const _variation = document.createElement("SPAN");
            const _icon = document.createElement("I");
            _card.className = "stats__card";
            _title.className = "stats__card__title";
            _value.className = "stats__card__value";
            _variation.className = "stats__card__variation";
            _icon.className = "stats__card__icon";
            _title.textContent = title;
            _value.textContent = value;
            _card.append(_title, _value);
            if (variation && !icon) {
                _variation.textContent = variation;
                _card.appendChild(_variation);
            }
            if (icon && !variation) {
                const classes = icon.split(" ");
                classes.forEach((cls)=>{
                    _icon.classList.add(cls);
                });
                _card.appendChild(_icon);
            }
            return _card;
        },
        menuItem: (title, icon, path)=>{
            const _item = document.createElement("LI");
            const classes = icon.split(" ");
            _item.className = "nav__item";
            classes.forEach((cls)=>{
                _item.classList.add(cls);
            });
            _item.setAttribute("title", title);
            _item.setAttribute("data-path", path);
            return _item;
        },
        listItem: (icon, date, species, groupSize, lat, long)=>{
            const _listItem = document.createElement("DIV");
            const _icon = document.createElement("I");
            const _date = document.createElement("TIME");
            const _species = document.createElement("H3");
            const _groupSize = document.createElement("P");
            const _coordinates = document.createElement("DIV");
            const _lat = document.createElement("SPAN");
            const _long = document.createElement("SPAN");
            const classes = icon.split(" ");
            _icon.className = "list__item__icon";
            classes.forEach((cls)=>{
                _icon.classList.add(cls);
            });
            _listItem.className = "list__item";
            _date.className = "list__item__date";
            _species.className = "list__item__species";
            _groupSize.className = "list__item__groupSize";
            _coordinates.className = "list__item__coordinates";
            _lat.className = "list__item__lat";
            _long.className = "list__item__long";
            _date.textContent = date;
            _species.textContent = species;
            _groupSize.textContent = groupSize;
            _lat.textContent = lat;
            _long.textContent = long;
            _coordinates.append(_lat, _long);
            _listItem.append(_icon, _date, _species);
            if (groupSize) _listItem.appendChild(_groupSize);
            if (lat && long) _listItem.appendChild(_coordinates);
            return _listItem;
        },
        panel: (title, className)=>{
            const panel = document.createElement("DIV");
            const header = document.createElement("H2");
            const body = document.createElement("DIV");
            panel.className = "panel";
            header.className = "panel__header";
            header.textContent = title;
            if (className) panel.classList.add(className);
            panel.append(header, body);
            return panel;
        },
        map: ()=>{
            const map = document.createElement("DIV");
            map.id = "map";
            map.className = "map";
            return map;
        },
        select: (data, species)=>{
            const select = document.createElement("SELECT");
            const option = document.createElement("OPTION");
            option.value = "all";
            option.textContent = "All species";
            select.appendChild(option);
            species.forEach((item)=>{
                const option = document.createElement("OPTION");
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
            select.addEventListener("change", (ev)=>{
                dataSpecies = ev.target.value;
                if (map) map.remove();
                renderMap(data, dataSpecies);
            });
            return select;
        }
    };
    /**
     * Renders Header section
     */ const renderHeader = ()=>{
        const title = view.appTitle();
        const welcome = view.welcome();
        DOM.appHeader.append(title, welcome);
    };
    /**
     * Renders Footer section
     */ const renderFooter = ()=>{
        DOM.appFooter.innerHTML = `
            <p>GPS Plots - © 2022 </p>
            <p>Developed with ♥ by <a href="https://ptmartins.gothub.io" target="_blank">Pedro Martins</a></p>
        `;
    };
    /**
     * Show map
     */ const showMap = (data, dataSpecies)=>{
        clearAppBody();
        setBodyClass(DOM.appBody, "app__body app__body--map");
        const title = view.viewTitle("Map");
        const select = view.select(data, species);
        const _map = view.map();
        title.appendChild(select);
        DOM.appBody.appendChild(title);
        DOM.appBody.appendChild(_map);
        renderMap(data, dataSpecies);
    };
    /**
     * 
     * @param {*} data 
     * @param {*} dataSpecies 
     */ const renderMap = (data, dataSpecies)=>{
        setTimeout(()=>{
            map = L.map("map").setView(mapOptions.center, mapOptions.zoom);
            map.options.maxZoom = mapOptions.maxZoom;
            map.options.minZoom = mapOptions.minZoom;
            map.setMaxBounds([
                mapCorners[1],
                mapCorners[2]
            ]);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 16,
                attribution: "\xa9 OpenStreetMap"
            }).addTo(map);
            addPoints(data, map);
        }, 1000);
    };
    /**
     * Add markers to map
     */ addPoints = (data, map)=>{
        for(var i = 0; i < data.length; i++){
            if (dataSpecies === "all") L.marker([
                data[i].latitude,
                data[i].longitude
            ]).bindPopup(data[i].common_name).addTo(map);
            else if (dataSpecies == data[i].common_name) L.marker([
                data[i].latitude,
                data[i].longitude
            ]).bindPopup(data[i].common_name).addTo(map);
        }
    };
    /**
     * Show list of observations
     */ const showObservations = (data)=>{
        setBodyClass(DOM.appBody, "app__body app__body--observations");
        clearAppBody();
        DOM.appBody.appendChild(view.viewTitle("Observations"));
        const table = document.createElement("DIV");
        const tableHeader = document.createElement("DIV");
        const tableBody = document.createElement("DIV");
        table.className = "table";
        tableHeader.className = "table__header";
        tableBody.className = "table__body";
        for(let i = 0; i < 5; i++){
            const headerCell = document.createElement("SPAN");
            switch(i){
                case 0:
                    headerCell.textContent = "";
                    break;
                case 1:
                    headerCell.textContent = "Date";
                    break;
                case 2:
                    headerCell.textContent = "Species";
                    break;
                case 3:
                    headerCell.textContent = "Group Size";
                    break;
                case 4:
                    headerCell.textContent = "Coordinates";
                    break;
                default:
                    break;
            }
            tableHeader.appendChild(headerCell);
        }
        data.forEach((item)=>{
            const row = view.listItem("fa-solid fa-binoculars", item.date_time, item.common_name, item.group_size, item.latitude, item.longitude);
            tableBody.appendChild(row);
        });
        table.append(tableHeader, tableBody);
        DOM.appBody.appendChild(table);
    };
    /**
     * Set app body modifier class
     * 
     * @param {*} el 
     * @param {*} newClasses 
     */ const setBodyClass = (el, newClasses)=>{
        let classes = newClasses.split(" ");
        el.classList.remove(...el.classList);
        classes.forEach((cls)=>{
            el.classList.add(cls);
        });
    };
    /**
     * Show list of observations
     */ const showDashboard = (data)=>{
        setBodyClass(DOM.appBody, "app__body app__body--dashboard");
        clearAppBody();
        calcStats(data);
        showDashboardChart(data);
        showLastObservations(data);
    };
    /**
     * Show Dashboard data
     * 
     * @param {*} data 
     */ const showDashboardChart = (data)=>{
        const container = document.createElement("DIV");
        const canvas = document.createElement("CANVAS");
        const ctx = canvas.getContext("2d");
        const labels = Object.keys(stats.species);
        const dataVals = Object.values(stats.species);
        container.className = "panel panel--dashBoardChart";
        canvas.className = "panel__canvas";
        canvas.id = "dashBoardChart";
        container.appendChild(canvas);
        labels.forEach((label, i)=>{
            let names = label.split(" ");
            names.forEach((name, j)=>{
                if (names.length > 1 && j == 0) names[j] = name.charAt(0).toUpperCase() + ".";
                label = names.join(" ");
            });
            labels[i] = label;
        });
        const settings = {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Observations by species",
                        data: dataVals
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };
        new Chart(ctx, settings);
        DOM.appBody.appendChild(container);
    };
    /**
     * 
     * @param {*} data 
     */ const showLastObservations = (data)=>{
        const container = view.panel("Last Observations", "panel--lastObservations");
        for(let i = 0; i < 8; i++){
            let item = view.listItem("fa-solid fa-binoculars", data[i].date_time, data[i].common_name);
            container.appendChild(item);
        }
        DOM.appBody.appendChild(container);
    };
    /**
     * Clears app body
     */ const clearAppBody = ()=>{
        DOM.appBody.innerHTML = "";
    };
    /**
     * Renders Navigation section
     * @param {*} obj 
     */ const renderNav = (obj)=>{
        DOM.menuItems = [];
        for(let item in obj){
            const _item = view.menuItem(obj[item].title, obj[item].icon, obj[item].path);
            DOM.navList.appendChild(_item);
            DOM.menuItems.push(_item);
        }
    };
    /**
     * Renders stats cards for homepage
     * @param {*} data 
     */ const calcStats = (data)=>{
        data.forEach((item)=>{
            stats.totalObservations += 1;
            if (stats.species[item.scientific_name]) stats.species[item.scientific_name] += 1;
            else stats.species[item.scientific_name] = 1;
            stats.totalGroupSize += item.group_size;
            stats.avgGroupSize = Math.round(stats.totalGroupSize / stats.totalObservations);
        });
        for(let el in stats.species)stats.totalSpecies += 1;
        renderStats();
    };
    /**
     * Render stats cards
     */ renderStats = ()=>{
        const totalSpeciesCard = view.statsCard("Total Species", stats.totalSpecies, undefined, "fa-solid fa-hashtag");
        const totalObservationsCard = view.statsCard("Total Observations", stats.totalObservations, undefined, "fa-solid fa-binoculars");
        const avgGroupSizeCard = view.statsCard("Average Group Size", stats.avgGroupSize, undefined, "fa-solid fa-binoculars");
        const statsWrapper = document.createElement("DIV");
        statsWrapper.className = "stats__wrapper";
        statsWrapper.append(totalSpeciesCard, totalObservationsCard, avgGroupSizeCard);
        DOM.appBody.appendChild(statsWrapper);
    };
    /**
     * Hide loading spinner
     */ const hideLoading = ()=>{
        DOM.loadingSpinner.style.display = "none";
    };
    /**
     * Fectches data from JSON
     */ const fetchData = async ()=>{
        const response = await fetch("/data/data.json");
        data = await response.json().then((data)=>{
            setTimeout(()=>{
                sortData(data);
                hideLoading();
                getSpecies(data);
                calcStats(data);
                showDashboard(data);
                setupEvents(data);
            }, 1000);
        });
    };
    /**
     * Get species from data
     */ const getSpecies = (data)=>{
        data.forEach((item)=>{
            let _species = item.common_name;
            if (!species.includes(_species)) species.push(_species);
        });
    };
    /**
     * Sort data from newest to oldest
     * 
     * @param {*} data 
     */ const sortData = (data)=>{
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric"
        };
        const locale = navigator.language;
        data.forEach((item)=>{
            item.date_time = new Date(item.date_time).toLocaleString(locale, options);
        });
        data.sort((a, b)=>new Date(b.date_time) - new Date(a.date_time));
    };
    /**
     * Setup events
     */ const setupEvents = (data)=>{
        DOM.menuItems.forEach((item)=>{
            item.addEventListener("click", ()=>{
                const path = item.getAttribute("data-path");
                if (path === "/map") showMap(data, dataSpecies);
                else if (path === "/observations") showObservations(data);
                else if (path === "/dashboard") showDashboard(data);
            });
        });
    };
    /**
     * Render layout
     */ const renderLayout = ()=>{
        renderHeader();
        renderFooter();
        renderNav(menu);
    };
    /**
     * Initializes app
     */ const init = ()=>{
        cacheDOM();
        renderLayout();
        fetchData();
    };
    window.addEventListener("DOMContentLoaded", init);
})();

//# sourceMappingURL=index.aa69868b.js.map
