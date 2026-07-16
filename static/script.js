// Mitchell Schwarzer Portfolio website logic
document.addEventListener("DOMContentLoaded", () => {
  // Global CV Data Store
  let cvData = null;
  let activeTab = "scholarly_articles";
  let searchQuery = "";
  let mediaSearchQuery = "";
  
  // Elements
  const educationContainer = document.getElementById("education-container");
  const timelineContainer = document.getElementById("timeline-container");
  const featuredBooksContainer = document.getElementById("featured-books-container");
  const hubItemsContainer = document.getElementById("hub-items-container");
  const searchInput = document.getElementById("search-input");
  const hubTabs = document.getElementById("hub-tabs");
  const mediaItemsContainer = document.getElementById("media-items-container");
  const mediaSearchInput = document.getElementById("media-search-input");
  const coursesGrid = document.getElementById("courses-grid");
  const fellowshipsContainer = document.getElementById("fellowships-container");
  const communityContainer = document.getElementById("community-container");
  const currentYearSpan = document.getElementById("current-year");
  const themeBtn = document.getElementById("theme-btn");
  const mainHeader = document.getElementById("main-header");
  
  // Set Current Year
  currentYearSpan.textContent = new Date().getFullYear();
  
  // Initialize Theme (Always default to light mode on start to show warm cream background)
  const savedTheme = "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  localStorage.setItem("theme", savedTheme);
  
  // Theme Toggle Click Handler
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
  
  // Sticky Header Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add("scrolled");
    } else {
      mainHeader.classList.remove("scrolled");
    }
    highlightNavLink();
  });
  
  // Fetch CV data
    fetch("/static/cv_data.json")
    .then(response => response.json())
    .then(data => {
      cvData = data;
      renderPortfolio();
    })
    .catch(error => {
      console.error("Error loading CV data:", error);
      // Fallback message if JSON loading fails
      hubItemsContainer.innerHTML = `<div class="no-results">Error loading database. Please run FastAPI backend.</div>`;
    });
    
  // Render main layout components
  function renderPortfolio() {
    if (!cvData) return;
    
    // Render Education
    renderEducation(cvData.education);
    
    // Render Experience Timeline
    renderTimeline(cvData.positions, cvData.professional_experience);
    
    // Render Books
    renderBooks(cvData.books);
    
    // Render Publications Hub (initial view)
    renderHub();
    
    // Render Media Hub
    renderMediaHub();
    
    // Render Courses
    renderCourses(cvData.courses);
    
    // Render Fellowships & Grants
    renderFellowships(cvData.fellowships);
    
    // Render Editorial Boards / Community
    renderCommunity(cvData.community);

    // Render Hero Profiles
    renderHeroProfiles(cvData.personal.external_links);
  }
  
  // Render Profiles in Hero
  function renderHeroProfiles(links) {
    const container = document.getElementById("hero-profiles-container");
    if (!container || !links) return;
    container.innerHTML = links.map(link => {
      const targetUrl = link.name === "Wikipedia Biography" ? link.url : `static/mock_viewer.html?title=${encodeURIComponent(link.name)}&source=Mitchell%20Schwarzer%20Profile%20Resources&year=2026&type=External%20Profile&url=${encodeURIComponent(link.url)}`;
      return `
        <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary); border-radius: var(--border-radius-sm); font-weight: 500; transition: var(--transition);">
          ${link.name}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      `;
    }).join('');
  }
  
  // Education Rendering
  function renderEducation(education) {
    educationContainer.innerHTML = education.map(edu => `
      <div class="edu-item">
        <h4 class="edu-degree">${edu.degree} in ${edu.field}</h4>
        <p class="edu-inst">${edu.institution}, ${edu.location}</p>
        <p class="edu-date">${edu.date}</p>
        ${edu.details ? `<p class="edu-detail">${edu.details}</p>` : ''}
      </div>
    `).join('');
  }
  
  // Positions and Professional Timeline Rendering
  function renderTimeline(positions, experience) {
    const timelineItems = [];
    
    // 1. Gather Faculty Positions
    positions.forEach(pos => {
      pos.roles.forEach(role => {
        timelineItems.push({
          date: role.period,
          title: role.title,
          sub: `${pos.institution} (${pos.location})`,
          desc: pos.department || "",
          admin: role.administrative || null,
          sortDate: parseSortDate(role.period)
        });
      });
    });
    
    // 2. Gather City Planner Experience
    experience.forEach(exp => {
      timelineItems.push({
        date: exp.period,
        title: exp.title,
        sub: `${exp.company} (${exp.location})`,
        desc: exp.details,
        admin: null,
        sortDate: parseSortDate(exp.period)
      });
    });
    
    // Sort timeline items chronologically (latest first)
    timelineItems.sort((a, b) => b.sortDate - a.sortDate);
    
    // Render Timeline Items
    timelineContainer.innerHTML = timelineItems.map((item, idx) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-content">
          <h3 class="timeline-title">${item.title}</h3>
          <p class="timeline-sub">${item.sub}</p>
          <p class="timeline-desc">${item.desc}</p>
          ${item.admin ? `
            <ul class="timeline-admin">
              ${item.admin.map(adminItem => `<li>${adminItem}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `).join('');
  }
  
  // Book Showcases
  function renderBooks(books) {
    // Only display books in books section (featured books first)
    const sortedBooks = [...books].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    
    featuredBooksContainer.innerHTML = sortedBooks.map(book => {
      // Create short visual title for book covers
      let shortTitle = book.title;
      if (book.title.includes(":")) {
        shortTitle = book.title.split(":")[0];
      }
      
      return `
        <article class="book-card">
          <div class="book-cover-mock">
            <h3 class="book-cover-title">${shortTitle}</h3>
            <span class="book-cover-tag">${book.year}</span>
          </div>
          <div class="book-info">
            <span class="book-meta">${book.publisher} • ${book.pages}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-desc">${book.description || ""}</p>
            ${book.url ? `
              <a href="static/mock_viewer.html?title=${encodeURIComponent(book.title)}&source=${encodeURIComponent(book.publisher)}&year=${encodeURIComponent(book.year)}&type=Book&url=${encodeURIComponent(book.url)}" target="_blank" rel="noopener noreferrer" class="book-link" aria-label="Purchase or view ${book.title}">
                Publisher Details 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');
  }
  
  // Dynamic Publications / Media Hub rendering
  function renderHub() {
    if (!cvData) return;
    
    // Select correct database field
    let list = [];
    let itemType = "";
    
    if (activeTab === "edited_works") {
      list = cvData.edited_works || [];
      itemType = "Edited Work";
    } else if (activeTab === "scholarly_articles") {
      list = cvData.scholarly_articles;
      itemType = "Scholarly Article";
    } else if (activeTab === "chapters") {
      list = cvData.chapters;
      itemType = "Book Chapter";
    } else if (activeTab === "essays") {
      list = cvData.essays;
      itemType = "Essay";
    } else if (activeTab === "reviews") {
      list = cvData.reviews;
      itemType = "Review";
    } else if (activeTab === "lectures") {
      list = cvData.lectures;
      itemType = "Lecture";
    }
    
    // Apply Search Filter
    let filteredList = list;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filteredList = list.filter(item => {
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const journalMatch = (item.journal || "").toLowerCase().includes(query);
        const bookMatch = (item.book || "").toLowerCase().includes(query);
        const pubMatch = (item.publication || "").toLowerCase().includes(query);
        const detailsMatch = (item.details || "").toLowerCase().includes(query);
        const sourceMatch = (item.source || "").toLowerCase().includes(query);
        const typeMatch = (item.type || "").toLowerCase().includes(query);
        const institutionMatch = (item.institution || "").toLowerCase().includes(query);
        const snippetMatch = (item.snippet || "").toLowerCase().includes(query);
        const publisherMatch = (item.publisher || "").toLowerCase().includes(query);
        const editorMatch = (item.editor || "").toLowerCase().includes(query);
        
        return titleMatch || journalMatch || bookMatch || pubMatch || detailsMatch || sourceMatch || typeMatch || institutionMatch || snippetMatch || publisherMatch || editorMatch;
      });
    }
    
    // Render list rows
    const totalItems = filteredList.length;
    if (totalItems === 0) {
      hubItemsContainer.innerHTML = `<div class="no-results">No records found matching your query.</div>`;
      return;
    }
    
    hubItemsContainer.innerHTML = filteredList.map(item => {
      // Build visual meta row based on fields
      let metaText = "";
      if (activeTab === "edited_works") {
        if (item.title.includes("Map and Guide")) {
          metaText = `${item.pages ? `${item.pages}, ` : ''}(${item.publisher}, ${item.year}).`;
        } else if (item.title.includes("Jeremy Blake")) {
          metaText = `ed. ${item.editor} (${item.publisher}, ${item.year}):`;
        } else {
          metaText = `(${item.year}):`;
        }
      } else if (activeTab === "scholarly_articles") {
        metaText = `Published in <strong>${item.journal}</strong> (${item.year}) ${item.pages ? `, pages ${item.pages}` : ''}`;
      } else if (activeTab === "chapters") {
        metaText = `Chapter in <em>${item.book}</em>, ed. ${item.editor || ""} • ${item.publisher} (${item.year})`;
      } else if (activeTab === "essays") {
        metaText = `In <strong>${item.publication}</strong> ${item.date ? `(${item.date})` : `(${item.year})`}`;
      } else if (activeTab === "reviews") {
        metaText = `Review in <strong>${item.journal}</strong> (${item.year}) ${item.pages ? `, pages ${item.pages}` : ''}`;
      } else if (activeTab === "lectures") {
        metaText = `Delivered at <strong>${item.institution}</strong> • ${item.date}`;
      }
      
      const hasUrl = item.url && item.url !== "#" && !item.url_unavailable;
      const targetUrl = hasUrl ? `static/mock_viewer.html?title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.journal || item.book || item.publication || item.source || "External Link")}&year=${encodeURIComponent(item.year || item.date || "")}&type=${encodeURIComponent(activeTab === "scholarly_articles" ? "Scholarly Article" : activeTab === "chapters" ? "Chapter" : activeTab === "essays" ? "Essay" : activeTab === "reviews" ? "Review" : "Publication")}&url=${encodeURIComponent(item.url)}` : "#";
      
      return `
        <${hasUrl ? `a href="${targetUrl}" target="_blank" rel="noopener noreferrer"` : 'div'} class="item-row ${hasUrl ? 'clickable' : ''}">
          <div class="item-main">
            <div class="item-meta" style="margin-bottom: 0.5rem;">
              <span class="item-tag">${item.type || itemType}</span>
              ${item.volume ? `<span class="item-tag" style="background-color: transparent; border: 1px solid var(--border-color);">${item.volume}</span>` : ''}
            </div>
            ${hasUrl ? `
              <h3 class="item-title-link">
                ${item.title}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; flex-shrink:0;">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </h3>
            ` : `
              <h3 class="item-title-link" style="color: var(--text-primary); cursor: default; hover: none;">${item.title}</h3>
            `}
            <p class="item-meta" style="margin-top: 0.25rem;">${metaText}</p>
            ${item.details ? `<p class="item-meta" style="font-style: italic; margin-top: 0.25rem;">${item.details}</p>` : ''}
          </div>
          ${hasUrl ? `
            <div class="item-link-btn" aria-label="Read external link: ${item.title}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          ` : ''}
        </${hasUrl ? 'a' : 'div'}>
      `;
    }).join('');
  }

  // Dynamic Media Hub rendering
  function renderMediaHub() {
    if (!cvData || !cvData.media_appearances) return;
    
    let list = [...cvData.media_appearances];
    
    // Chronological sort helper
    const parseItemDate = (dateStr) => {
      if (!dateStr) return 0;
      const d = Date.parse(dateStr);
      if (!isNaN(d)) return d;
      const yearMatch = dateStr.match(/\d{4}/);
      if (yearMatch) {
        let val = parseInt(yearMatch[0]);
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const lowercase = dateStr.toLowerCase();
        for (let i = 0; i < months.length; i++) {
          if (lowercase.includes(months[i])) {
            return val * 12 + i;
          }
        }
        return val * 12;
      }
      return 0;
    };
    
    list.sort((a, b) => parseItemDate(b.date) - parseItemDate(a.date));
    
    // Apply Search Filter
    let filteredList = list;
    if (mediaSearchQuery.trim() !== "") {
      const query = mediaSearchQuery.toLowerCase();
      filteredList = list.filter(item => {
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const sourceMatch = (item.source || "").toLowerCase().includes(query);
        const typeMatch = (item.type || "").toLowerCase().includes(query);
        const dateMatch = (item.date || "").toLowerCase().includes(query);
        const detailsMatch = (item.details || "").toLowerCase().includes(query);
        
        return titleMatch || sourceMatch || typeMatch || dateMatch || detailsMatch;
      });
    }
    
    if (filteredList.length === 0) {
      mediaItemsContainer.innerHTML = `<div class="no-results">No media records found matching your query.</div>`;
      return;
    }
    
    mediaItemsContainer.innerHTML = filteredList.map(item => {
      const metaText = `<strong>${item.type}</strong> via ${item.source} • ${item.date}`;
      const hasUrl = item.url && item.url !== "#" && !item.url_unavailable;
      const targetUrl = hasUrl ? `static/mock_viewer.html?title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.source || "External Link")}&year=${encodeURIComponent(item.date || "")}&type=${encodeURIComponent("Media")}&url=${encodeURIComponent(item.url)}` : "#";
      
      return `
        <${hasUrl ? `a href="${targetUrl}" target="_blank" rel="noopener noreferrer"` : 'div'} class="item-row ${hasUrl ? 'clickable' : ''}">
          <div class="item-main">
            <div class="item-meta" style="margin-bottom: 0.5rem;">
              <span class="item-tag">${item.type || "Media"}</span>
            </div>
            ${hasUrl ? `
              <h3 class="item-title-link">
                ${item.title}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; flex-shrink:0;">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </h3>
            ` : `
              <h3 class="item-title-link" style="color: var(--text-primary); cursor: default; hover: none;">${item.title}</h3>
            `}
            <p class="item-meta" style="margin-top: 0.25rem;">${metaText}</p>
            ${item.details ? `<p class="item-meta" style="font-style: italic; margin-top: 0.25rem;">${item.details}</p>` : ''}
          </div>
          ${hasUrl ? `
            <div class="item-link-btn" aria-label="Read external link: ${item.title}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          ` : ''}
        </${hasUrl ? 'a' : 'div'}>
      `;
    }).join('');
  }
  
  // Tab Event Listeners
  hubTabs.addEventListener("click", (e) => {
    const targetTab = e.target.closest(".tab-btn");
    if (!targetTab) return;
    
    // Update active tab styles
    hubTabs.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    
    targetTab.classList.add("active");
    targetTab.setAttribute("aria-selected", "true");
    
    // Reset limits and fetch tab content
    activeTab = targetTab.dataset.tab;
    renderHub();
    highlightNavLink();
  });
  
  // Search Box Event Listener
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderHub();
  });
  
  if (mediaSearchInput) {
    mediaSearchInput.addEventListener("input", (e) => {
      mediaSearchQuery = e.target.value;
      renderMediaHub();
    });
  }
  
  // Render Courses
  function renderCourses(courses) {
    coursesGrid.innerHTML = `
      <div class="course-card">
        <h3 class="course-card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Core Lectures
        </h3>
        <ul class="course-list">
          ${courses.lectures.map(lecture => `<li>${lecture}</li>`).join('')}
        </ul>
      </div>
      <div class="course-card">
        <h3 class="course-card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          Seminars
        </h3>
        <ul class="course-list">
          ${courses.seminars.map(seminar => `<li>${seminar}</li>`).join('')}
        </ul>
      </div>
      <div class="course-card">
        <h3 class="course-card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          Workshops
        </h3>
        <ul class="course-list">
          ${courses.workshops.map(workshop => `<li>${workshop}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Render Grants & Fellowships
  function renderFellowships(fellowships) {
    fellowshipsContainer.innerHTML = fellowships.map(f => `
      <div class="fellowship-item">${f}</div>
    `).join('');
  }
  
  // Render Editorial Boards
  function renderCommunity(community) {
    communityContainer.innerHTML = community.map(c => `
      <div class="fellowship-item" style="border-color: var(--border-color);">${c}</div>
    `).join('');
  }
  
  // Timeline sorting date helper
  function parseSortDate(periodStr) {
    const cleanStr = periodStr.split("-")[0].trim().toLowerCase();
    
    // Extract year using regex
    const yearMatch = cleanStr.match(/\d{4}/);
    if (yearMatch) {
      let yearVal = parseInt(yearMatch[0]);
      
      // Fine-tune order for Spring/Fall in same year
      if (cleanStr.includes("fall")) {
        return yearVal + 0.5;
      }
      if (cleanStr.includes("spring")) {
        return yearVal + 0.1;
      }
      return yearVal;
    }
    
    return 0; // Default fallback
  }
  
  // Programmatic Tab Switcher
  function switchTab(tabName) {
    const targetBtn = hubTabs.querySelector(`[data-tab="${tabName}"]`);
    if (!targetBtn) return;
    
    hubTabs.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    
    targetBtn.classList.add("active");
    targetBtn.setAttribute("aria-selected", "true");
    
    activeTab = tabName;
    renderHub();
    highlightNavLink();
  }
  
  const pubsLinks = [document.getElementById("nav-pubs-link"), document.getElementById("footer-pubs-link")];
  
  pubsLinks.forEach(link => {
    if (link) {
      link.addEventListener("click", () => {
        switchTab("scholarly_articles");
      });
    }
  });


  // Scroll spy helper to highlight active link
  const sections = document.querySelectorAll("section, footer");
  const navLinks = document.querySelectorAll(".nav-links a");
  
  function highlightNavLink() {
    let scrollPos = window.scrollY + 200; // Offset for header height
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            if (id === "publications-hub") {
              if (link.id === "nav-pubs-link") {
                link.classList.add("active");
              }
            } else {
              link.classList.add("active");
            }
          }
        });
      }
    });
  }
});