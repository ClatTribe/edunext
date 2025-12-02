import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: number;
  "College Name": string | null;
  City?: string | null;
  State?: string | null;
}

export const CourseMatcherVisual: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select('id, "College Name", City, State')
        .not("College Name", "is", null)
        .limit(5);

      if (error) throw error;

      if (data) {
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-white">
        <h3 className="text-3xl font-bold text-[#2f61ce] mb-2 tracking-tight">Find Your Perfect Course</h3>
        <p className="text-slate-500 mb-8 text-lg">Explore Programs and Institutes Across India</p>
        
        <div className="flex gap-4 mb-8">
           <button className="bg-[#2f61ce] text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors">
             <GraduationCap size={18} /> All Courses
           </button>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search for programs or institutes..." 
            className="w-full border border-slate-200 rounded-lg pl-5 pr-12 py-4 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-[#2f61ce] transition-all outline-none text-lg" 
          />
          <Search className="absolute right-4 top-4.5 text-slate-400 group-focus-within:text-[#2f61ce] transition-colors" size={24} />
        </div>
      </div>
      
      <div className="bg-slate-50 flex-1 p-6 overflow-hidden relative">
         {loading ? (
           <div className="flex justify-center items-center h-full">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f61ce]"></div>
           </div>
         ) : (
           <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-lg flex-shrink-0">
                        {course["College Name"]?.[0] || "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-slate-900 text-base mb-1 truncate">
                           {course["College Name"] || "Institute Information Not Available"}
                         </h4>
                         {(course.City || course.State) && (
                           <div className="flex items-center gap-1 text-sm text-slate-600">
                             <MapPin size={14} className="flex-shrink-0" />
                             <span className="truncate">
                               {course.City && course.State 
                                 ? `${course.City}, ${course.State}` 
                                 : course.City || course.State}
                             </span>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
              {/* Fade out overlay to imply scrolling */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
           </div>
         )}
      </div>
    </div>
  );
};