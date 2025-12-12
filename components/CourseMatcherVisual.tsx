import React, { useState, useEffect } from 'react';
// Adding BookOpen for the required visual style
import { GraduationCap, MapPin, BookOpen } from 'lucide-react'; 
import { supabase } from '../lib/supabase';

// Define the Course interface
interface Course {
    id: number;
    "College Name": string | null;
    City?: string | null;
    State?: string | null;
}

// --------------------------------------------------------------------------------------
// Main Component
// --------------------------------------------------------------------------------------

export const CourseMatcherVisual: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    // Dark Teal color for the icon/accents
    const accentColor = '#008080'; 

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // Limit to 6 to ensure scrollability is apparent
            const { data, error } = await supabase
                .from("courses")
                .select('id, "College Name", City, State')
                .not("College Name", "is", null)
                .limit(6); 

            if (error) throw error;
            if (data) setCourses(data as Course[]);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            // Added a slight delay for better visual effect on initial load
            setTimeout(() => setLoading(false), 500); 
        }
    };

    return (
        // Reduced vertical length by using `max-h-full` and smaller p-values
        <div className="p-1 max-w-lg mx-auto rounded-2xl bg-gradient-to-br from-[#024687] to-[#0ea5e9]">
            <div className="w-full bg-[#0f172a] backdrop-blur-xl rounded-xl p-6 flex flex-col gap-4 border border-white/10 shadow-2xl overflow-hidden">
                
                {/* Header Section - Reduced padding and vertical space */}
                <div className="border-b border-white/10 pb-4">
                    <div className="flex justify-between items-center mb-3">
                        {/* Title Box - 🎨 CHANGED: Using BookOpen icon with Teal color as requested */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white uppercase">
                            <BookOpen className="w-4 h-4" style={{ color: accentColor }} /> 
                            MBA Finder
                        </div>
                        {/* Single, consistent icon for the complete section, using GraduationCap */}
                        <GraduationCap className="w-8 h-8 text-white/50" /> 
                    </div>

                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1 tracking-tight">
                        Find Your Dream MBA College
                    </h3>
                    <p className="text-sm text-slate-400">
                        Explore Programs and Institutes Across India
                    </p>
                </div>
                
                {/* Courses list Section - Fixed height and enforced scrollability */}
                <div className="flex-1 overflow-hidden relative" style={{ maxHeight: '350px' }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-full min-h-[200px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: accentColor }}></div>
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto h-full pr-2">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-[#1e293b] p-3 rounded-lg border border-white/10 shadow-md hover:border-[#0ea5e9]/50 transition-all flex items-start gap-3"
                                    >
                                        {/* Icon/College Icon - Uses GraduationCap with Teal color */}
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" 
                                             style={{ backgroundColor: `${accentColor}1A`, border: `1px solid ${accentColor}33`, color: accentColor }}>
                                            <GraduationCap className="w-5 h-5" /> 
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-base truncate">
                                                {course["College Name"] || "Institute Information Not Available"}
                                            </h4>
                                            {(course.City || course.State) && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    {/* Map Pin color remains for contrast */}
                                                    <MapPin size={12} className="shrink-0 text-[#f59e0b]" /> 
                                                    <span className="truncate">
                                                        {course.City && course.State
                                                            ? `${course.City}, ${course.State}`
                                                            : course.City || course.State}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 p-8">
                                    No college data to display.
                                </div>
                            )}

                            {/* Faded overlay at the bottom for scroll effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseMatcherVisual;