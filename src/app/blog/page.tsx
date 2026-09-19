import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Clock, User } from "lucide-react";
import { CLINIC_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Oral Health Blog | Dr. Dental Crest Dental Surgery",
  description:
    "Dental education articles, preventive oral hygiene advice, and dental care guides from Dr. Dental Crest Dental Surgery in Kampala.",
};

export default async function BlogPage() {
  let posts = [];
  try {
    posts = await prisma.blogPost.findMany({
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="section-rhythm bg-white border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <span className="text-[13px] font-semibold tracking-wider text-[#0a2e0e] uppercase">
              Dental Education & Insights
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-normal text-[#181d26] tracking-tight leading-tight">
              Oral Health Advice & Clinic Articles
            </h1>
            <p className="text-[17px] text-[#333840] leading-relaxed">
              Explore informative guides on preventive hygiene, what to expect during dental consultations, family smile care, and orthodontic insights.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section-rhythm bg-[#f8fafc] border-b border-[#dddddd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-xl border border-[#dddddd] p-7 flex flex-col justify-between hover:border-gray-400 transition-colors shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[12px] text-[#41454d]">
                    <span className="px-2.5 py-1 bg-[#f8fafc] border border-[#dddddd] rounded font-medium text-[#0a2e0e]">
                      {post.category?.name || "Dental Care"}
                    </span>
                    <span className="text-gray-500">Draft Article</span>
                  </div>

                  <h2 className="text-[20px] font-medium text-[#181d26] hover:text-[#0a2e0e] transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-[14px] text-[#41454d] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#dddddd] flex items-center justify-between text-[13px]">
                  <span className="text-[#41454d]">Clinic Editorial</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-medium text-[#1b61c9] hover:text-[#1a3866] flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
