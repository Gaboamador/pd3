import React from "react";

export function highlightText(node, query, className) {

  if (!query) return node;

  const q = query.toLowerCase();
  const regex = new RegExp(`(${query})`, "gi");

  function walk(n) {

    if (typeof n === "string") {

      if (!regex.test(n)) return n;

      const parts = n.split(regex);

      return parts.map((part, i) => {

        if (part.toLowerCase() === q) {
          return (
            <span key={i} className={className}>
              {part}
            </span>
          );
        }

        return part;
      });
    }

    if (Array.isArray(n)) {
      return n.map(walk);
    }

    if (React.isValidElement(n)) {

      return React.cloneElement(n, {
        ...n.props,
        children: walk(n.props.children)
      });

    }

    return n;
  }

  return walk(node);
}