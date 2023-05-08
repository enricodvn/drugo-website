import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'

function Article() {

  const { article, category } = useParams();

  const [articleMd, setArticleMd] = useState('');

  useEffect(() => {
    fetch(`/articles/${category}/${article}/en.md`)
      .then(res => res.text())
      .then(res => setArticleMd(res));
  });

  return (
    <div className="content">
      <ReactMarkdown children={articleMd} />
    </div>
  )
}

export default Article;
