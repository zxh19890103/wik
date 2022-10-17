function extractHeads() {
  const content = document.querySelector('#articleContent');

  const name = /^H\d$/;

  let html = '';

  for (const child of content.children) {
    if (!name.test(child.tagName)) continue;
    const href = child.firstElementChild.getAttribute('href');
    html += `<li class="pageNavList__item pageNavList__item--${child.tagName}"><a href="javascript:void(0);" onclick="__scroll_to_anchor__('${href}')">${child.textContent}</a></li>`;
  }

  const doc = document.createElement('ul');
  doc.className = 'pageNavList';
  doc.innerHTML = html;

  const h = document.createElement('h3');
  h.textContent = '内容';

  const pageNav = document.querySelector('#pageNav');

  pageNav.appendChild(h);
  pageNav.appendChild(doc);

  setTimeout(() => {
    doc.classList.add('visible');
  }, 30);
}

setTimeout(extractHeads, 10);

/**
 * @type {HTMLDivElement}
 */
let __focus_div__ = null;

function __scroll_to_anchor__(selector) {
  /**
   * @type {HTMLHeadElement}
   */
  const h = document.querySelector(selector);
  if (!h) return;

  const top = h.offsetTop;

  __focus_div__ = __focus_div__ || document.querySelector('.focus');

  let varTop = __focus_div__.scrollTop;

  const animate = () => {
    varTop += delta;

    if (Math.abs(top - varTop) < 10) {
      __focus_div__.scrollTo(0, top);
      return;
    } else {
      __focus_div__.scrollBy(0, delta);
      requestAnimationFrame(animate);
    }
  };

  const delta = top > varTop ? 10 : -10;

  // animate();

  __focus_div__.scrollTo(0, top);
}
