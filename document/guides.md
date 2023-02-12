---
layout: page
title: Guides
---

{% assign filtered_pages = site.pages | where: "categories", "guide"  %}

<ul>
{% for page in filtered_pages %}
    <li><a href="{{ page.url }}">{{ page.title }}</a></li>
{% endfor %}
</ul>