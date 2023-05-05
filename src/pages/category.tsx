import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Category() {

  const { category } = useParams();

  const [categoryMd, setCategoryMd] = useState('');

  useEffect(() => {
    fetch(`/articles/${category}/en.md`)
      .then(res => res.text())
      .then(res => setCategoryMd(res));
  });

  return (
    <div className="content">
      <ReactMarkdown
      components={{
        // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
        a: ({node, ...props}) => <Link to={props.href} {...props} />
      }}
      children={categoryMd} />
    </div>
  )
}

export default Category;
