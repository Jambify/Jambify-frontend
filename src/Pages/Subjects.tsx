import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useSubjectStore } from '../Store/useSubjectStore';
import SubjectCard from '../components/Subjects/SubjectCard';
import SubjectTopics from '../components/Subjects/SubjectTopic';

const Subjects: React.FC = () => {
  const subjects = useSubjectStore((s) => s.subjects);

  return (
    <AppLayout currentPage="subjects">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="font-display text-4xl font-black text-textMain tracking-tighter mb-2">
            My Subjects
          </h1>
          <p className="text-textDim text-lg">
            Monitor your coverage of the JAMB syllabus.
          </p>
        </header>

        {/* Top Section: Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub) => (
            <SubjectCard key={sub.id} subject={sub} />
          ))}
        </div>

        {/* Bottom Section: Detailed Weaknesses */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <h2 className="font-display  font-bold text-textMain uppercase tracking-widest text-xl">
              Revision Priority
            </h2>
          </div>
          <SubjectTopics subjects={subjects} />
        </section>
      </div>
    </AppLayout>
  );
};

export default Subjects;