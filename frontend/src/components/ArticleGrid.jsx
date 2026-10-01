import ArticleCard from './ArticleCard.jsx'

export default function ArticleGrid({ articles }) {
  return (
    <div className="grid">
      {articles.map((a) => (
        <ArticleCard key={a.slug} article={a} />
      ))}
    </div>
  )
}
