import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About 6AMKICK | Performance-Focused Running Blog</title>
        <meta name="description" content="Learn about 6AMKICK, a running blog dedicated to racing, training, and competitive mindset with daily briefings focused on real racing conditions." />
        <link rel="canonical" href="https://6amkick.vercel.app/about" />
      </Helmet>

      <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* About Content */}
          <article className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About 6AMKICK
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                6AMKICK is a running blog dedicated to racing, training, and competitive mindset.
                The site publishes daily briefings focused on real racing conditions rather than perfect scenarios.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Our Focus
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                Every morning at 6AM, we deliver a focused briefing covering:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Racing mindset and competition strategies</li>
                <li>Training discipline and consistency</li>
                <li>Performing in less-than-ideal conditions</li>
                <li>Real race insights and tactical analysis</li>
                <li>Mental preparation and competitive thinking</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Philosophy
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                Most running content focuses on perfect conditions, ideal circumstances, and theoretical scenarios.
                6AMKICK takes a different approach: we focus on the reality of competition.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Races don't wait for perfect weather. Training doesn't pause for life's complications.
                Competition demands adaptability, discipline, and the ability to perform regardless of conditions.
                That's what 6AMKICK is about.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Daily Briefings
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                Each briefing delivers:
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>One Story:</strong> A race result, training insight, or competitive scenario</li>
                <li><strong>One Lesson:</strong> The tactical or mental takeaway</li>
                <li><strong>One Thing to Try:</strong> An actionable concept for your own training or racing</li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                Quick to read, focused on performance, and designed for runners who compete.
              </p>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Briefings
              </Button>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default About;
