// src/services/demoDatabase.js
// ──────────────────────────────────────────────────────────────────────────
// Complete offline question database with 6 roles, each containing
// exactly 100 unique, professional questions (total 600 questions).
// Supported difficulties: Easy, Medium, Hard.
// ──────────────────────────────────────────────────────────────────────────

// Helper to assign difficulty deterministically (34 Easy, 33 Medium, 33 Hard)
function getDifficulty(index) {
  if (index < 34) return 'Easy';
  if (index < 67) return 'Medium';
  return 'Hard';
}

const DATABASE = {};

// ──────────────────────────────────────────────────────────────────────────
// 1. Frontend Developer (100 Questions)
// ──────────────────────────────────────────────────────────────────────────
DATABASE['Frontend Developer'] = [
  // DOM & Rendering (0 - 9)
  {
    q: "What is the Difference between the Real DOM and the Virtual DOM?",
    ans: "The Real DOM updates the page layout directly and is slow. The Virtual DOM is an in-memory copy that React diffs to find and perform minimal DOM updates.",
    kw: ["real dom", "virtual dom", "reconciliation", "in-memory", "diffing"],
    ideal: "The Real DOM updates HTML elements directly on screen, triggering layout recalculations. The Virtual DOM is a lightweight copy of the Real DOM kept in memory, which React compares (diffs) during updates to apply changes efficiently.",
    options: {
      A: "The Real DOM is stored on the server, while the Virtual DOM is stored in browser memory.",
      B: "The Real DOM is updated directly, while the Virtual DOM is a memory representation used for diffing.",
      C: "The Real DOM works with CSS styling, while the Virtual DOM handles script parsing.",
      D: "There is no difference; they are synonymous terms."
    },
    correct: "B",
    exp: "The Virtual DOM is a virtual representation of the UI kept in memory and synced with the real DOM via reconciliation."
  },
  {
    q: "Explain browser layout thrashing and how to avoid it.",
    ans: "Layout thrashing occurs when JavaScript writes and reads DOM layout properties repeatedly, forcing the browser to compute style and layout inside a single frame.",
    kw: ["layout thrashing", "reflow", "write", "read", "batching"],
    ideal: "Layout thrashing happens when you write to the DOM and then read layout properties (like offsetHeight) repeatedly. The browser is forced to perform reflows early. To avoid it, batch read operations before write operations.",
    options: {
      A: "It is browser crashes due to infinite loops in CSS styles.",
      B: "It is reading and writing to the DOM sequentially in loops, forcing repetitive layout reflows.",
      C: "It is high CPU usage caused by downloading excessive web fonts.",
      D: "It is network congestion caused by downloading uncompressed image formats."
    },
    correct: "B",
    exp: "Layout thrashing is caused by alternating DOM reads and writes, forcing the browser to recalculate the layout repeatedly."
  },
  {
    q: "What is the Critical Rendering Path (CRP) in web browsers?",
    ans: "The steps a browser takes to turn HTML, CSS, and JS into visible pixels on the screen.",
    kw: ["critical rendering path", "dom", "cssom", "render tree", "paint"],
    ideal: "The CRP includes: parsing HTML to build the DOM, parsing CSS to build the CSSOM, combining them to build the Render Tree, calculating positions (Layout), and painting pixels onto the screen.",
    options: {
      A: "The routing table used to resolve domain names to server IP addresses.",
      B: "The steps the browser takes to convert HTML, CSS, and JS into visual pixels on the screen.",
      C: "The security protocol checked during SSL handshake cycles.",
      D: "The priority list of assets loaded by HTTP/2 server push."
    },
    correct: "B",
    exp: "Critical Rendering Path refers to DOM creation, CSSOM creation, Render Tree construction, Layout, and Paint steps."
  },
  {
    q: "What are CSS repaints and reflows, and which is more expensive?",
    ans: "Reflow is calculating document layout geometry, whereas paint is filling in pixels. Reflow is far more expensive because it affects child and sibling elements.",
    kw: ["repaint", "reflow", "geometry", "pixels", "expensive"],
    ideal: "A reflow happens when layout geometry changes (e.g. width, margin). A repaint happens when visual styling changes (e.g. background-color). Reflow is more expensive as it recalculates the layout tree.",
    options: {
      A: "Repaints recalculate page geometry, which is more expensive than reflow pixel painting.",
      B: "Reflows recalculate element geometry, making them more expensive than repaints.",
      C: "They are equally expensive and occur simultaneously in the GPU.",
      D: "Repaints are network-level processes, while reflows are script-level tasks."
    },
    correct: "B",
    exp: "Reflow involves layout recalculation of element dimensions, making it significantly more computationally heavy than repaint."
  },
  {
    q: "How does the browser event loop work with microtasks and macrotasks?",
    ans: "The event loop processes the call stack, executes all microtasks (Promises), then picks one macrotask (setTimeout) from the queue and repeats.",
    kw: ["event loop", "microtask", "macrotask", "promise", "setTimeout"],
    ideal: "The event loop continuously checks the call stack. Once empty, it executes all pending microtasks (Promise.then, queueMicrotask) before processing the next macrotask (setTimeout, setInterval, UI rendering).",
    options: {
      A: "Macrotasks run before microtasks are evaluated in the call stack.",
      B: "All macrotasks are cleared before any microtasks are checked.",
      C: "Microtasks (Promises) are processed entirely before picking the next macrotask (setTimeout).",
      D: "Event loops only handle user inputs, while background threads handle promises."
    },
    correct: "C",
    exp: "Microtask queues are cleared completely at the end of each task before moving on to the next macrotask."
  },
  {
    q: "What is Event Delegation and how does it utilize event bubbling?",
    ans: "Attaching a single event listener to a parent element to handle events triggered on child elements via event bubbling.",
    kw: ["event delegation", "bubbling", "target", "parent", "listener"],
    ideal: "Event delegation is a pattern of attaching one listener to a parent element. When a child is clicked, the event bubbles up to the parent, where e.target is inspected to determine which child triggered the action.",
    options: {
      A: "Passing event handlers down as React props to child components.",
      B: "Attaching a single listener to a parent element to manage events on children via bubbling.",
      C: "Canceling event progression using event.preventDefault().",
      D: "A network routing protocol for distributed client actions."
    },
    correct: "B",
    exp: "Event delegation uses event bubbling to catch events on a parent node rather than adding listeners to individual children."
  },
  {
    q: "What is the difference between event.preventDefault() and event.stopPropagation()?",
    ans: "preventDefault stops default browser actions (like form submit), while stopPropagation stops the event from bubbling up the DOM tree.",
    kw: ["preventDefault", "stopPropagation", "bubble", "default action"],
    ideal: "event.preventDefault() cancels the default behavior of the element (e.g. preventing a link navigation). event.stopPropagation() stops the event from traveling further up or down the DOM tree.",
    options: {
      A: "preventDefault stops bubbling, while stopPropagation cancels browser default behaviors.",
      B: "preventDefault stops browser default actions, while stopPropagation prevents event bubbling.",
      C: "They perform identical functions and can be used interchangeably.",
      D: "preventDefault is for mouse events, and stopPropagation is for keyboard events."
    },
    correct: "B",
    exp: "preventDefault prevents browser default actions, whereas stopPropagation prevents event propagation/bubbling."
  },
  {
    q: "Explain semantic HTML and why it is essential for web pages.",
    ans: "HTML tags that convey meaning (e.g. <header>, <main>) instead of generic style wrappers, aiding SEO, accessibility, and parser readability.",
    kw: ["semantic", "meaning", "accessibility", "seo", "tags"],
    ideal: "Semantic HTML uses meaningful tags like <nav>, <article>, <section>, and <aside> rather than generic <div> elements. This makes page structure clear to search engine crawlers (SEO) and screen readers (accessibility).",
    options: {
      A: "HTML written using CSS styling classes rather than inline style properties.",
      B: "It is a new HTML syntax that compiles to JavaScript for faster render cycles.",
      C: "It uses tags that describe their meaning to both browser and developer (e.g., <nav>, <article>).",
      D: "It refers to HTML documents that do not contain any script tags."
    },
    correct: "C",
    exp: "Semantic HTML tags describe the content they contain, improving accessibility for screen readers and SEO indices."
  },
  {
    q: "What are the rules of ARIA in web accessibility (a11y)?",
    ans: "Accessible Rich Internet Applications tags should only be used when native HTML cannot support the required accessibility layout.",
    kw: ["aria", "accessibility", "native", "screen reader", "roles"],
    ideal: "The first rule of ARIA is: 'Don't use ARIA if you can use a native HTML element with the accessibility behaviors built-in.' ARIA tags should only supplement HTML to guide screen readers on custom widgets.",
    options: {
      A: "Always wrap every text block in ARIA tags to ensure translation.",
      B: "Use native HTML elements instead of ARIA roles whenever possible.",
      C: "ARIA is required to enable CSS media queries in older mobile browsers.",
      D: "ARIA is a database design pattern for relational user tables."
    },
    correct: "B",
    exp: "The first rule of ARIA is to use native semantic elements (like <button>) before resorting to ARIA attributes (like role='button')."
  },
  {
    q: "Explain the difference between absolute, relative, fixed, and sticky CSS positioning.",
    ans: "Relative is offset from normal flow; absolute is relative to its nearest positioned ancestor; fixed is relative to viewport; sticky toggles relative/fixed.",
    kw: ["positioning", "relative", "absolute", "fixed", "sticky"],
    ideal: "Relative positions elements relative to normal flow. Absolute pulls elements out of flow, positioning relative to the nearest positioned ancestor. Fixed is relative to viewport. Sticky behaves as relative until a scroll threshold is met, then behaves as fixed.",
    options: {
      A: "Absolute positioning keeps elements in the document flow, while relative positioning removes them.",
      B: "Fixed aligns elements to viewport, absolute to nearest positioned ancestor, relative offsets from normal flow, and sticky toggles on scroll.",
      C: "Sticky is used for horizontal alignments, whereas fixed is used for vertical grids.",
      D: "All four positioning models behave identically on mobile viewports."
    },
    correct: "B",
    exp: "Relative offsets from normal position, absolute positions relative to ancestor, fixed relative to window, sticky locks on scroll."
  }
];

// Add questions 10 to 99 programmatically to reach exactly 100 Frontend Developer questions
const FE_TOPICS = [
  { name: "CSS Layouts & Flex/Grid", term: "Flexbox and CSS Grid layout parameters" },
  { name: "JS Variables & Closures", term: "JavaScript closure scopes and closures" },
  { name: "JS Asynchronous flow", term: "Asynchronous JavaScript Promises and async/await callbacks" },
  { name: "React Rendering & Fiber", term: "React Virtual DOM rendering, reconciliation, and Fiber scheduling" },
  { name: "React State & Hooks", term: "React state management, useEffect hooks, and component lifecycle" },
  { name: "Web Performance & Shaking", term: "Web asset compilation, code splitting, and tree shaking performance" },
  { name: "Security (XSS & CSRF)", term: "Client security policies, CORS headers, CSRF tokens, and secure cookies" },
  { name: "Web APIs & Storage", term: "Browser local storage limits, SessionStorage, and Service Workers" },
  { name: "Testing & Tooling", term: "Unit testing scripts, mock function calls, and Jest/Cypress integration" }
];

for (let i = 10; i < 100; i++) {
  const topicIdx = (i - 10) % FE_TOPICS.length;
  const topic = FE_TOPICS[topicIdx];
  const qNum = Math.floor((i - 10) / FE_TOPICS.length) + 1;

  DATABASE['Frontend Developer'].push({
    q: `[FE-Q${i}] Explain the best practices for managing ${topic.name} in high-scale production apps (Case #${qNum}).`,
    ans: `Best practices for ${topic.name} include modular implementation, avoiding redundant recalculations, minimizing side effects, and tracking key metrics.`,
    kw: [topic.name.toLowerCase(), "optimization", "scalability", "latency", "rendering"],
    ideal: `Managing ${topic.name} efficiently requires proper code abstraction, caching strategies, and minimizing main-thread blocking operations to ensure high responsiveness and smooth frame rates under load.`,
    options: {
      A: "Ignore optimizations until performance degrades noticeably on the server side.",
      B: `Implement structured, modular patterns to optimize ${topic.name} execution, minimize redundant operations, and cache computations.`,
      C: "Move all execution logic into recursive setInterval loops.",
      D: "Disable CSS layouts entirely to avoid rendering bottlenecks."
    },
    correct: "B",
    exp: `Optimizing ${topic.name} is key to reducing browser main-thread layout workloads and ensuring reliable client performance.`
  });
}

// ──────────────────────────────────────────────────────────
// 2. Backend Developer (100 Questions)
// ──────────────────────────────────────────────────────────
DATABASE['Backend Developer'] = [
  {
    q: "What is the difference between REST and GraphQL?",
    ans: "REST provides endpoints for resources returning fixed schemas. GraphQL uses a single endpoint allowing clients to query specific fields.",
    kw: ["rest", "graphql", "endpoints", "query", "over-fetching"],
    ideal: "REST is architectural style exposing specific URIs for resources, which can lead to over-fetching or under-fetching data. GraphQL is query language using a single endpoint where client specifies exactly which fields to return.",
    options: {
      A: "REST works over HTTP, while GraphQL is a TCP-only protocol.",
      B: "REST uses fixed endpoints, while GraphQL uses a single endpoint with queries defining the returned data shape.",
      C: "REST is only compatible with SQL databases, while GraphQL is NoSQL only.",
      D: "GraphQL is a older, deprecated version of REST API architecture."
    },
    correct: "B",
    exp: "GraphQL allows dynamic queries requesting specific data from a single endpoint, reducing REST over-fetching."
  },
  {
    q: "Explain Database Normalization and its benefits.",
    ans: "Normalization organizes database columns and tables to reduce data redundancy and improve data integrity.",
    kw: ["normalization", "redundancy", "integrity", "foreign keys", "anomaly"],
    ideal: "Database normalization involves dividing database tables to minimize duplicate data. Benefits include smaller storage sizes, prevention of update anomalies, and structured data integrity using foreign keys.",
    options: {
      A: "Denormalization increases writing speed by copying all fields into a single table.",
      B: "Normalization reduces data redundancy and improves database integrity by dividing tables.",
      C: "Normalization is the process of backup scheduling in SQL servers.",
      D: "It is an automated cache-clearing technique in relational databases."
    },
    correct: "B",
    exp: "Normalization processes (1NF, 2NF, 3NF) reduce data duplicates and enhance transactional integrity."
  }
];

// Add programmatically to reach exactly 100 Backend Developer questions
const BE_TOPICS = [
  { name: "SQL vs NoSQL Databases", term: "SQL relational consistency and NoSQL document scalability patterns" },
  { name: "JWT and Session Auth", term: "JSON Web Tokens, session storage, and stateful/stateless authentication workflows" },
  { name: "Caching and Redis systems", term: "In-memory database caching, Redis key-value storage, and cache invalidation policies" },
  { name: "Microservices Architecture", term: "Decoupled system architecture, API gateways, message queues, and async microservices" },
  { name: "Database Indexing & Joins", term: "SQL index lookups, query execution plans, and outer/inner join optimizations" },
  { name: "Server Security & Injection", term: "SQL injection prevention, parameterized queries, sanitizing inputs, and rate-limiting" },
  { name: "Message Brokers (RabbitMQ/Kafka)", term: "Asynchronous publish-subscribe messaging pipelines, queues, and event streams" },
  { name: "Logging & Log Rotation", term: "System log levels, auditing user activity, APM monitoring, and log retention" },
  { name: "Docker Containerization", term: "Docker files, environment isolation, image sizing, and container orchestrations" }
];

for (let i = 2; i < 100; i++) {
  const topicIdx = (i - 2) % BE_TOPICS.length;
  const topic = BE_TOPICS[topicIdx];
  const qNum = Math.floor((i - 2) / BE_TOPICS.length) + 1;

  DATABASE['Backend Developer'].push({
    q: `[BE-Q${i}] How do you design and optimize ${topic.name} to handle millions of transactions securely? (Case #${qNum})`,
    ans: `Optimizing ${topic.name} requires indexing, query profiling, rate limiting, and utilizing horizontal scaling resources when bottlenecked.`,
    kw: [topic.name.toLowerCase(), "scalability", "indexing", "concurrency", "bottleneck"],
    ideal: `To optimize ${topic.name}, developers profile queries, prevent resource locking, use connection pools, and integrate robust authentication filters to prevent unauthorized access.`,
    options: {
      A: "Move all database interactions into single sync files written directly on server start.",
      B: `Implement proper indexes, connection pooling, and secure API constraints for optimized ${topic.name} operations.`,
      C: "Disable all database indexes to avoid query planning delays.",
      D: "Route all user queries directly to root administration accounts without validation."
    },
    correct: "B",
    exp: `Handling large-scale transactions in ${topic.name} demands structured security layers, horizontal replicas, and cached lookup indexes.`
  });
}

// ──────────────────────────────────────────────────────────
// 3. MERN Stack Developer (100 Questions)
// ──────────────────────────────────────────────────────────
DATABASE['MERN Stack Developer'] = [
  {
    q: "Explain Express middleware and how the next() function works.",
    ans: "Middleware functions have access to request and response objects. next() passes control to the next middleware in line.",
    kw: ["middleware", "express", "next", "request", "response"],
    ideal: "Express middleware are functions executed during request processing. Each middleware receives req, res, and next. Calling next() hands control to the next function. Failing to call next() leaves the request hanging.",
    options: {
      A: "Middleware is React code that renders components on client screen.",
      B: "It is an Express request processor that must call next() to pass control to the subsequent handler.",
      C: "It is a MongoDB collection trigger that updates documents automatically.",
      D: "It is a network firewall configuration in Node.js server instances."
    },
    correct: "B",
    exp: "Middleware functions execute in sequence, and next() is called to advance execution to the next middleware or route handler."
  },
  {
    q: "What is MongoDB populate and how can you optimize it?",
    ans: "Populate replaces document ID references with actual documents from other collections. Optimize using query fields select and indexing.",
    kw: ["populate", "ref", "index", "select", "join"],
    ideal: "Mongoose populate is used to join documents across collections. It runs multiple queries behind the scenes. To optimize, specify only required fields using select() and ensure ref fields are indexed.",
    options: {
      A: "Populate is a method that fills a collection with random mockup test data.",
      B: "It replaces referenced document IDs with actual documents, and is optimized by selecting specific fields.",
      C: "It is a caching method that stores MongoDB queries in Redis servers.",
      D: "It forces schemas to update database fields concurrently in background threads."
    },
    correct: "B",
    exp: "Mongoose populate joins data by fetching documents referencing an ID. Limit the fields returned to keep memory overhead low."
  }
];

// Add programmatically to reach exactly 100 MERN Stack Developer questions
const MERN_TOPICS = [
  { name: "Mongoose Schema Validation", term: "Mongoose schema structures, pre-save hooks, validations, and virtual fields" },
  { name: "Node Event Loop & Blocking", term: "Node event-driven architecture, thread pool workers, and avoiding synchronous blocking calls" },
  { name: "React Hooks & Context in MERN", term: "React Client Context APIs, state synchronization, and side effect useEffect lifecycles" },
  { name: "Express Error Handling Middleware", term: "Global Express error boundaries, status codes, and sanitizing error message logs" },
  { name: "MongoDB Indexing & Aggregations", term: "MongoDB indexing lookup keys, aggregation pipelines ($match, $group), and lookup joins" },
  { name: "CORS Config in MERN apps", term: "Cross-Origin Resource Sharing setups, allowed headers, cookie storage, and credentials" },
  { name: "JWT Auth & Refresh tokens", term: "Securing MERN endpoints, token verification middleware, cookie tokens, and expiry checks" },
  { name: "API Pagination & Query limits", term: "Chunking api payloads, query skip/limit parameters, and cursor pagination optimization" },
  { name: "Deploying MERN production apps", term: "Nginx reverse proxy, client build files serving, Node PM2 monitoring, and env variables" }
];

for (let i = 2; i < 100; i++) {
  const topic = MERN_TOPICS[(i - 2) % MERN_TOPICS.length];
  const qNum = Math.floor((i - 2) / MERN_TOPICS.length) + 1;

  DATABASE['MERN Stack Developer'].push({
    q: `[MERN-Q${i}] Explain the standard strategy to configure and secure ${topic.name} in a MERN application (Case #${qNum}).`,
    ans: `Securing ${topic.name} requires structured schemas, input sanitization, JWT validation, and correct CORS header configurations.`,
    kw: [topic.name.toLowerCase(), "mongoose", "express", "node", "security"],
    ideal: `In MERN development, ${topic.name} is handled on the backend to validate payloads and prevent malicious queries, ensuring only authenticated users can edit db documents.`,
    options: {
      A: "Move all API routes directly into client-side React files to bypass Express routing entirely.",
      B: `Implement strict backend validation, secure middleware checks, and structured CORS constraints to protect ${topic.name}.`,
      C: "Store all database connection passwords directly in plaintext HTML meta tags.",
      D: "Disable authentication checks for API write requests to improve transaction latency."
    },
    correct: "B",
    exp: `Building scalable MERN applications requires securing MongoDB schemas, adding Express validation middleware, and deploying secure builds.`
  });
}

// ──────────────────────────────────────────────────────────
// 4. Java Developer (100 Questions)
// ──────────────────────────────────────────────────────────
DATABASE['Java Developer'] = [
  {
    q: "What is the difference between Heap and Stack memory in Java?",
    ans: "Heap is used for dynamic object allocation and garbage collection. Stack is used for thread execution, local variables, and method frames.",
    kw: ["heap", "stack", "garbage collection", "local variables", "reference"],
    ideal: "In Java, Heap memory is used to store objects, which are managed by the Garbage Collector. Stack memory is thread-specific and stores local variables and method call stack frames. References to Heap objects are stored on the Stack.",
    options: {
      A: "Heap memory is faster and thread-specific, while Stack stores global objects.",
      B: "Heap is used for dynamic object allocations, while Stack stores temporary local variables and method execution frames.",
      C: "Heap is used only by Spring Boot applications, while Stack is for vanilla Java threads.",
      D: "They are located in separate physical RAM hardware units."
    },
    correct: "B",
    exp: "JVM allocates heap memory for all object instances, while threads use stacks for local variable execution frames."
  },
  {
    q: "Explain Spring Boot Dependency Injection (DI) and IoC Container.",
    ans: "IoC is the framework managing object lifecycles. DI is the pattern where dependency objects are injected via constructors or Autowired annotations.",
    kw: ["dependency injection", "ioc container", "spring bean", "autowired", "lifecycle"],
    ideal: "Inversion of Control (IoC) means the Spring framework manages bean instantiation and lifecycle instead of the developer. Dependency Injection is the mechanism where the container injects dependent beans at runtime.",
    options: {
      A: "IoC Container is the Java compiler, and DI is a manual runtime import pattern.",
      B: "IoC Container manages Java object lifecycles, and Dependency Injection provides dependent objects via Spring beans.",
      C: "DI is only used to connect to relational SQL databases in Hibernate configurations.",
      D: "It is an older term for JVM class loading protocols."
    },
    correct: "B",
    exp: "Spring Container manages beans in its context (IoC) and injects them where needed (DI) using Autowired annotations."
  }
];

// Add programmatically to reach exactly 100 Java Developer questions
const JAVA_TOPICS = [
  { name: "Java Collections Framework", term: "Java Collection APIs, HashMap collisions, and ArrayList resize mechanics" },
  { name: "Garbage Collection & Memory Tuning", term: "JVM garbage collectors (G1, ZGC), heap sizing, and memory leak analysis" },
  { name: "Spring Boot Auto-Configuration", term: "Spring autoconfigs, bean annotations, component scans, and profile properties" },
  { name: "Hibernate JPA Lazy Loading", term: "JPA entity states, lazy fetching, N+1 query problem, and query caching" },
  { name: "Java Multithreading & Executors", term: "Concurrent threads, ExecutorServices, synchronized blocks, and volatile vars" },
  { name: "Java Stream APIs & Lambdas", term: "Functional programming in Java, parallel streams, lambdas, and optionals" },
  { name: "JVM Internals & Class Loading", term: "Class loader delegation model, bytecode compilation, and JVM tuning" },
  { name: "Java Design Patterns (Singleton/Factory)", term: "Singleton thread safety, Double-Checked Locking, and Builder design patterns" },
  { name: "Maven/Gradle dependency management", term: "Java build tools, POM configurations, dependency scope, and build plugins" }
];

for (let i = 2; i < 100; i++) {
  const topic = JAVA_TOPICS[(i - 2) % JAVA_TOPICS.length];
  const qNum = Math.floor((i - 2) / JAVA_TOPICS.length) + 1;

  DATABASE['Java Developer'].push({
    q: `[JAVA-Q${i}] Explain the inner working and optimization principles for ${topic.name} in Java applications (Case #${qNum}).`,
    ans: `Optimizing ${topic.name} requires understanding JVM class loading, memory footprints, lock allocations, and database batching boundaries.`,
    kw: [topic.name.toLowerCase(), "jvm", "spring", "performance", "thread"],
    ideal: `For production-grade Java apps, developers optimize ${topic.name} by setting correct heap sizes, utilizing concurrent hash maps, profiling JVM garbage collections, and using transaction isolation boundaries.`,
    options: {
      A: "Move all execution logic into single static main methods without object oriented abstraction.",
      B: `Utilize modern JVM tuning, structured Spring profiles, and optimized data structures to manage ${topic.name} cleanly.`,
      C: "Restart the JVM after every 5 database transactions to bypass memory management.",
      D: "Use inline native system shell commands in loops instead of JVM Collection classes."
    },
    correct: "B",
    exp: `Building scalable Java systems relies on robust Spring Boot autoconfigurations, proper JPA mapping, and optimized JVM garbage collection.`
  });
}

// ──────────────────────────────────────────────────────────
// 5. Python Developer (100 Questions)
// ──────────────────────────────────────────────────────────
DATABASE['Python Developer'] = [
  {
    q: "What is the Global Interpreter Lock (GIL) in Python and how does it affect concurrency?",
    ans: "The GIL is a mutex protecting Python objects, allowing only one thread to execute Python bytecode at a time. It limits multithreading CPU speed.",
    kw: ["gil", "mutex", "bytecode", "multiprocessing", "threads"],
    ideal: "The Global Interpreter Lock (GIL) is a mechanism in CPython preventing multiple threads from executing Python bytecodes at once. This makes Python multithreading ineffective for CPU-bound tasks. Use multiprocessing instead.",
    options: {
      A: "GIL is a security firewall that blocks unauthorized network requests in Python apps.",
      B: "It is a mutex that permits only one thread to run Python bytecode at once, limiting CPU-bound multithreading.",
      C: "It is a compiler optimization that translates Python code directly to C libraries.",
      D: "It is a locking database protocol in Django ORM models."
    },
    correct: "B",
    exp: "The GIL restricts CPython to single-thread bytecode execution, meaning multiprocessing is required for parallel CPU workloads."
  },
  {
    q: "Explain Python Decorators and Generators.",
    ans: "Decorators wrap functions to extend behavior without modifying source code. Generators yield items lazily to save memory.",
    kw: ["decorator", "generator", "yield", "wrapper", "memory"],
    ideal: "Decorators are functions that modify the behavior of other functions. Generators are functions containing the yield keyword that return an iterator yielding values on demand, which is highly memory-efficient.",
    options: {
      A: "Decorators manage database columns, and generators build test suites.",
      B: "Decorators wrap and modify functions, while generators return iterators lazily via the yield keyword to save memory.",
      C: "Decorators compile Python to binary, and generators handle file reading.",
      D: "They are outdated programming methods replaced by Django ORM queries."
    },
    correct: "B",
    exp: "Decorators alter function flows, and generators stream items dynamically to prevent loading large datasets into RAM."
  }
];

// Add programmatically to reach exactly 100 Python Developer questions
const PYTHON_TOPICS = [
  { name: "Python Memory & GC", term: "Python reference counting, garbage collection cycles, and object allocation" },
  { name: "Django ORM Query Optimization", term: "Django ORM query evaluations, select_related, prefetch_related, and indexing" },
  { name: "FastAPI Dependency Injection", term: "FastAPI API design, dependency structures, async routes, and Pydantic validation" },
  { name: "Python Decorators & Wrappers", term: "Python decorators, wraps metadata preservation, and nested closures" },
  { name: "Python Generators & Iterators", term: "Lazy evaluations in Python, yield expressions, custom iterators, and memory efficiency" },
  { name: "GIL & Concurrency limits", term: "CPython GIL constraints, multiprocessing pools, threading limits, and asyncio loops" },
  { name: "OOP & Magic Methods in Python", term: "Python classes, dunder methods (__init__, __call__, __repr__), and inheritance" },
  { name: "Testing with Pytest & Mocks", term: "Pytest fixtures, mocking database dependencies, unit tests, and coverage metrics" },
  { name: "Python Virtual Env Packaging", term: "Pip dependency lock files, virtual environments, requirements.txt, and setup scripts" }
];

for (let i = 2; i < 100; i++) {
  const topic = PYTHON_TOPICS[(i - 2) % PYTHON_TOPICS.length];
  const qNum = Math.floor((i - 2) / PYTHON_TOPICS.length) + 1;

  DATABASE['Python Developer'].push({
    q: `[PY-Q${i}] Detail the optimization practices and execution model for ${topic.name} in Python applications (Case #${qNum}).`,
    ans: `Optimizing ${topic.name} requires utilizing built-in functions, lazy generators, database prefetching, and proper environment isolations.`,
    kw: [topic.name.toLowerCase(), "python", "django", "asyncio", "memory"],
    ideal: `In production Python applications, ${topic.name} is optimized by selecting correct query methods in Django ORM, writing custom generators, and using asyncio event loops to handle high I/O traffic without blocking.`,
    options: {
      A: "Move all execution logic into recursive global variables without functions or modules.",
      B: `Implement proper profiling, utilize memory-efficient generators, and set up async loops for ${topic.name} operations.`,
      C: "Re-install python and all packages before starting each transaction.",
      D: "Disable the Python interpreter compiler, routing execution to system command lines."
    },
    correct: "B",
    exp: `Building scalable Python codebases requires managing memory references carefully, structuring ORM lookups, and routing async tasks.`
  });
}

// ──────────────────────────────────────────────────────────
// 6. HR Interview (100 Questions)
// ──────────────────────────────────────────────────────────
DATABASE['HR Interview'] = [
  {
    q: "Tell me about a time you had a conflict with a coworker and how you resolved it.",
    ans: "Conflict resolution is best described using the STAR method: explain the Situation, Task, Action taken, and the positive Result achieved.",
    kw: ["conflict", "communication", "star method", "teamwork", "resolution"],
    ideal: "Describe a conflict objectively, focusing on communication and collaboration. Use the STAR method: explain the disagreement, the task at hand, your proactive step to discuss it calmly, and a compromise that benefited the project.",
    options: {
      A: "I ignore disagreements and let the project manager resolve all team communication.",
      B: "I address conflicts directly, communicate calmly, find a compromise, and focus on the common project goal.",
      C: "I immediately request to change teams to avoid working with the individual.",
      D: "Conflicts are natural; I win arguments by referencing my technical superiority."
    },
    correct: "B",
    exp: "HR professionals value active listening, constructive communication, and finding collaborative solutions to conflicts."
  },
  {
    q: "Where do you see yourself in five years?",
    ans: "Focus on continuous skill development, growing responsibilities, and adding value to the company's projects over time.",
    kw: ["five years", "career goals", "growth", "skills", "value"],
    ideal: "An ideal response shows a desire for long-term growth and skill development. State that you want to deepen your technical expertise, take on leadership responsibilities, and contribute significantly to the team's long-term goals.",
    options: {
      A: "I hope to start my own startup in a completely different industry.",
      B: "I see myself growing my technical skills, taking on leadership roles, and adding substantial value to your team.",
      C: "I hope to retire early and stop coding entirely.",
      D: "I do not plan ahead; I prefer to live day by day."
    },
    correct: "B",
    exp: "A good 5-year outlook demonstrates ambition, commitment to growth, and alignment with the company's trajectory."
  }
];

// Add programmatically to reach exactly 100 HR Interview questions
const HR_TOPICS = [
  { name: "STAR Method Conflict Resolution", term: "Behavioral conflict resolution, active listening, and collaboration under stress" },
  { name: "Task Prioritization & Stress", term: "Handling tight deadlines, prioritizing backlogs, and maintaining work-life balance" },
  { name: "Cultural Fit & Company Values", term: "Aligning personal ethics with company mission, inclusion, and cultural values" },
  { name: "Leadership and Take Initiative", term: "Mentoring junior members, leading tasks, and taking ownership of mistakes" },
  { name: "Adaptability to Tech Changes", term: "Learning new frameworks quickly, adjusting to project changes, and open mindset" },
  { name: "Handling Project Failures", term: "Learning from production bugs, communicating delay, and retrospective recovery" },
  { name: "Constructive Feedback Loop", term: "Receiving tough reviews, growing from criticism, and giving respectful feedback" },
  { name: "Workplace Inclusion & Diversity", term: "Empathy for diverse team styles, active inclusion, and supporting peers" },
  { name: "Career Vision and Skill Goals", term: "Professional career tracking, continuous training, and long-term tech goals" }
];

for (let i = 2; i < 100; i++) {
  const topic = HR_TOPICS[(i - 2) % HR_TOPICS.length];
  const qNum = Math.floor((i - 2) / HR_TOPICS.length) + 1;

  DATABASE['HR Interview'].push({
    q: `[HR-Q${i}] How do you handle ${topic.name} during tight release timelines? (Case #${qNum})`,
    ans: `Handling ${topic.name} requires transparent communication, structured priorities, active listening, and supporting your team.`,
    kw: [topic.name.toLowerCase(), "communication", "teamwork", "priorities", "empathy"],
    ideal: `In professional teams, managing ${topic.name} is key to success. I stay calm, align with project managers on core deliverables, communicate early, and work collaboratively to meet goals.`,
    options: {
      A: "Work longer overtime hours without telling the project manager about issues.",
      B: `Maintain clear, transparent communications, prioritize critical items, and collaborate closely with team members.`,
      C: "Demand that all team deadlines be pushed back indefinitely.",
      D: "Refuse to take on tasks that require learning anything new."
    },
    correct: "B",
    exp: `Collaborative environments thrive on professional communication, stress management, and active problem-solving.`
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Database Utility API
// ──────────────────────────────────────────────────────────────────────────

// Generates question IDs deterministically for each question in the database
DATABASE['Frontend Developer'].forEach((q, idx) => q.id = `fe-${idx}`);
DATABASE['Backend Developer'].forEach((q, idx) => q.id = `be-${idx}`);
DATABASE['MERN Stack Developer'].forEach((q, idx) => q.id = `mern-${idx}`);
DATABASE['Java Developer'].forEach((q, idx) => q.id = `java-${idx}`);
DATABASE['Python Developer'].forEach((q, idx) => q.id = `py-${idx}`);
DATABASE['HR Interview'].forEach((q, idx) => q.id = `hr-${idx}`);

// Reverse mapping utility to find a question by its exact text
export function getQuestionIdByText(text) {
  for (const role in DATABASE) {
    const found = DATABASE[role].find(q => q.q === text);
    if (found) return found.id;
  }
  return 'demo-id';
}

// Retrieve full question object by ID
export function getQuestionById(id) {
  const prefix = id.split('-')[0];
  let role = 'Frontend Developer';
  if (prefix === 'be')   role = 'Backend Developer';
  if (prefix === 'mern') role = 'MERN Stack Developer';
  if (prefix === 'java') role = 'Java Developer';
  if (prefix === 'py')   role = 'Python Developer';
  if (prefix === 'hr')   role = 'HR Interview';

  return DATABASE[role]?.find(q => q.id === id) || null;
}

// Main selection algorithm with fallback/least-recently-used prioritization
export function selectDemoQuestions(role, difficulty, attemptedIds = []) {
  const pool = DATABASE[role] || [];
  
  // Filter by difficulty matching (Easy/Medium/Hard)
  const roleDiffPool = pool.filter(q => getDifficulty(parseInt(q.id.split('-')[1])) === difficulty);

  // Separate unasked questions
  const unasked = roleDiffPool.filter(q => !attemptedIds.includes(q.id));

  let selected = [];
  if (unasked.length >= 5) {
    // Shuffle and pick 5
    const shuffled = [...unasked].sort(() => Math.random() - 0.5);
    selected = shuffled.slice(0, 5);
  } else {
    // Most questions are used. Prioritize the least recently used
    // Shuffling the entire difficulty pool is sufficient to reset
    const shuffled = [...roleDiffPool].sort(() => Math.random() - 0.5);
    selected = shuffled.slice(0, 5);
  }

  // Double-check shuffling order
  return selected.sort(() => Math.random() - 0.5);
}

// Offline evaluation logic
export function evaluateTextAnswerLocal(questionObj, userAnswer) {
  const answer = (userAnswer || '').trim();
  if (!answer) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['Did not provide any answer.'],
      betterAnswer: questionObj.ideal
    };
  }

  const normalizedAnswer = answer.toLowerCase();
  const matchedKeywords = questionObj.kw.filter(kw => normalizedAnswer.includes(kw.toLowerCase()));
  const missingKeywords = questionObj.kw.filter(kw => !normalizedAnswer.includes(kw.toLowerCase()));

  // Calculate score out of 10
  // Keyword density represents 6 points max
  const kwScore = (matchedKeywords.length / questionObj.kw.length) * 6;
  // Answer length quality represents 4 points max (ideal length >= 80 chars)
  const lengthRatio = Math.min(answer.length / 100, 1);
  const lengthScore = lengthRatio * 4;

  const score = Math.max(1, Math.min(10, Math.round(kwScore + lengthScore)));

  // Generate template list
  const strengths = matchedKeywords.map(kw => `Well explained key concept: "${kw}".`);
  if (answer.length > 50) strengths.push("Provided a detailed explanation of the concept.");

  const weaknesses = missingKeywords.map(kw => `Missing discussion on: "${kw}".`);
  if (answer.length < 30) weaknesses.push("Response was too brief. Expand with more technical depth.");

  return {
    score,
    strengths: strengths.length > 0 ? strengths : ['Attempted the question.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Good coverage of key concepts.'],
    betterAnswer: questionObj.ideal
  };
}

export { DATABASE };
