/* /scripts/header.js */
(async function injectHeader(){
  const mount = document.getElementById('site-header');
  if(!mount) return; // if a page doesn't have the mount point, do nothing

  try{
    // load the shared header html
    const res = await fetch('/partials/header.html', { cache: 'no-store' });
    const html = await res.text();
    mount.innerHTML = html;

    // highlight the "active" nav link
    const here = location.pathname.replace(/\/+$/, '');
    mount.querySelectorAll('nav a').forEach(a=>{
      const href = a.getAttribute('href').replace(/\/+$/, '');
      if(here.endsWith(href)) a.classList.add('active');
    });
  }catch(err){
    console.error('Header load failed:', err);
  }
})();
