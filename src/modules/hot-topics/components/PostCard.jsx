import { Heart, MessageCircle, Eye, Bookmark, TrendingUp } from 'lucide-react'
import { useStore } from '../../../store/useStore'

const CATEGORY_COLORS = {
  Tech:    'bg-blue-100 text-blue-700',
  Sports:  'bg-green-100 text-green-700',
  Music:   'bg-purple-100 text-purple-700',
  Finance: 'bg-yellow-100 text-yellow-700',
  Gaming:  'bg-red-100 text-red-700',
  Art:     'bg-pink-100 text-pink-700',
}

export default function PostCard({ post, onClick, rank }) {
  const likePost     = useStore(s => s.likePost)
  const bookmarkPost = useStore(s => s.bookmarkPost)

  function handleLike(e) {
    e.stopPropagation()
    likePost(post.id)
  }

  function handleBookmark(e) {
    e.stopPropagation()
    bookmarkPost(post.id)
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">

        {/* Rank badge */}
        {rank && (
          <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
            ${rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
            {rank}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{post.avatar}</span>
            <span className="text-xs text-gray-500 font-medium">@{post.author}</span>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Content preview */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.content}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-blue-500 hover:text-blue-700">#{tag}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart size={13} fill={post.liked ? 'currentColor' : 'none'} />
              {post.likes.toLocaleString()}
            </button>

            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle size={13} />
              {post.comments.toLocaleString()}
            </span>

            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye size={13} />
              {post.views.toLocaleString()}
            </span>

            <span className="flex items-center gap-1 text-xs text-amber-500 ml-auto">
              <TrendingUp size={13} />
              {post.score.toLocaleString()}
            </span>

            <button
              onClick={handleBookmark}
              className={`transition-colors ${post.bookmarked ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}
            >
              <Bookmark size={13} fill={post.bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}