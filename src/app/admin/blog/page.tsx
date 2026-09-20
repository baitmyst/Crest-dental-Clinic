import { getBlogPosts } from "@/lib/admin-data";
import Link from "next/link";
import { BookOpen, Edit, CheckCircle2, ArrowRight } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#dddddd]">
        <div>
          <h1 className="text-[24px] font-medium text-[#181d26]">
            Oral Health Blog Posts
          </h1>
          <p className="text-[13px] text-[#41454d]">
            Manage dental education articles, draft states, and SEO meta tags.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-[#dddddd] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="px-2 py-0.5 rounded bg-[#f8fafc] border border-[#dddddd] text-[#0a2e0e] font-medium">
                  {post.category?.name || "General"}
                </span>
                <span className="text-gray-400 font-mono">/{post.slug}</span>
              </div>
              <h3 className="text-[18px] font-medium text-[#181d26]">
                {post.title}
              </h3>
              <p className="text-[13px] text-[#41454d] line-clamp-2">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold uppercase">
                {post.status}
              </span>
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="btn-secondary text-[12px] py-1.5 px-3"
              >
                <span>Preview ↗</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
