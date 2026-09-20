import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, Phone, ArrowLeft, ArrowRight, User, BookOpen } from "lucide-react";
import { CLINIC_NAME, CLINIC_PHONE, CLINIC_PHONE_DIGITS, PRIMARY_CTA, SECONDARY_CTA } from "@/lib/constants";
import { getBlogPostBySlug } from "@/lib/admin-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.seoTitle || post.title} | ${CLINIC_NAME}`,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="bg-[#f8fafc] border-b border-[#dddddd] py-3 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-[13px] text-[#41454d]">
          <Link href="/" className="hover:text-[#181d26]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/blog" className="hover:text-[#181d26]">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#181d26] font-medium truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      {/* Article Body Container */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#f8fafc] border border-[#dddddd] rounded-full text-[12px] font-semibold uppercase tracking-wider text-[#0a2e0e]">
              {post.category?.name || "Dental Care"}
            </span>
            <h1 className="text-[32px] sm:text-[40px] font-normal text-[#181d26] tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-[13px] text-[#41454d] pt-2 border-b border-[#dddddd] pb-6">
              <span>Published by Dr. Dental Crest Editorial Team</span>
              <span>•</span>
              <span>Draft Clinic Article</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none text-[#333840] leading-relaxed space-y-5 text-[16px]">
            {post.content.split("\n\n").map((paragraph: string, idx: number) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-[24px] font-medium text-[#181d26] pt-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-[19px] font-medium text-[#181d26] pt-2">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>
        </div>

        {/* Back link */}
        <div className="pt-10 border-t border-[#dddddd] mt-12 flex justify-between items-center">
          <Link
            href="/blog"
            className="text-[14px] font-medium text-[#181d26] hover:text-[#0a2e0e] flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>
          <Link
            href="/services"
            className="text-[14px] font-medium text-[#1b61c9] hover:underline"
          >
            Explore Dental Services
          </Link>
        </div>

        {/* Mandatory Appointment Request CTA at end of every post */}
        <div className="mt-12 bg-[#f5e9d4] border border-[#d9a441]/40 rounded-xl p-8 text-[#181d26] space-y-4">
          <h3 className="text-[22px] font-medium">
            Schedule Your Dental Visit in Kampala
          </h3>
          <p className="text-[14px] text-[#333840] leading-relaxed">
            Have questions about your oral health or want to schedule a preventive check-up? Request an appointment with Dr. Silver today without account registration.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/request-appointment" className="btn-primary text-[14px]">
              <Calendar className="w-4 h-4" />
              <span>{PRIMARY_CTA}</span>
            </Link>
            <a href={`tel:${CLINIC_PHONE_DIGITS}`} className="btn-secondary text-[14px]">
              <Phone className="w-4 h-4 text-[#0a2e0e]" />
              <span>{SECONDARY_CTA}</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
