import { X, Heart, MessageCircle, Eye, Bookmark, TrendingUp, Share2 } from 'lucide-react'
import { useStore } from '../../../store/useStore'

const CATEGORY_COLORS = {
  Tech: 'bg-blue-100 text-blue-700', Sports: 'bg-green-100 text-green-700',
  Music: 'bg-purple-100 text-purple-700', Finance: 'bg-yellow-100 text-yellow-700',
  Gaming: 'bg-red-100 text-red-700', Art: 'bg-pink-100 text-pink-700',
}

const MOCK_COMMENTS = [
  { id: 1, author: 'curious_user',  avatar: '🧐', text: 'This is fascinating. Thanks for sharing!', likes: 24 },
  { id: 2, author: 'skeptic_42',    avatar: '🤔', text: 'Interesting but I need more sources before believing this.', likes: 12 },
  { id: 3, author: 'enthusiast_x',  avatar: '🙌', text: 'Been waiting for this for so long. Absolutely incredible news!', likes: 38 },
  { id: 4, author: 'deep_thinker',  avatar: '💭', text: 'The implications of this are massive. Think about what this means for the next decade.', likes: 51 },
  { id: 5, author: 'casual_reader', avatar: '😊', text: 'Good read. Shared with my team.', likes: 8 },
]

export default function PostDetail({ post, onClose }) {
  const likePost     = useStore(s => s.likePost)
  const bookmarkPost = useStore(s => s.bookmarkPost)

  if (!post) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[post.category]}`}>
            {post.category}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Author */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{post.avatar}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">@{post.author}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-amber-500 text-xs">
              <TrendingUp size={14} />
              <span className="font-semibold">{post.score.toLocaleString()} score</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{post.title}</h2>

          {/* Content */}
          <p className="text-sm text-gray-600 leading-relaxed">{post.content}</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            This story is developing. Our reporters are following the situation closely and will provide
            updates as more information becomes available. The community response has been overwhelming,
            with thousands of reactions pouring in from around the world.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#{tag}</span>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100">
            <button
              onClick={() => likePost(post.id)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
            >
              <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
              {post.likes.toLocaleString()}
            </button>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle size={16} /> {post.comments.toLocaleString()}
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Eye size={16} /> {post.views.toLocaleString()}
            </span>
            <button
              onClick={() => bookmarkPost(post.id)}
              className={`ml-auto flex items-center gap-2 text-sm font-medium transition-colors ${post.bookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            >
              <Bookmark size={16} fill={post.bookmarked ? 'currentColor' : 'none'} />
              Save
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Comments ({post.comments.toLocaleString()})</h3>
            {MOCK_COMMENTS.map(c => (
              <div key={c.id} className="flex gap-3">
                <span className="text-2xl shrink-0">{c.avatar}</span>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">@{c.author}</p>
                  <p className="text-xs text-gray-600">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1">❤️ {c.likes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}