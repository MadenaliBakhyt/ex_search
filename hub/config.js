// EXIM Search hub — link configuration.
//
// Edit the URLs below to point at wherever each project is actually deployed
// (a subdomain, a path behind a reverse proxy, or a plain host:port for local
// testing). This file is loaded separately from index.html on purpose: in
// Docker you can bind-mount your own copy over this one to change the links
// without rebuilding the hub image.
window.EXIM_LINKS = {
  cargo: "http://localhost:3001",
  nums: "http://localhost:3002",
  tnved: "http://localhost:3003",
};

