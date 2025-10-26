// lib/profileCache.ts
// Centralized cache management for profile data

interface ProfileData {
  name?: string;
  degree?: string;
  last_course_cgpa?: string;
  gre?: number;
  toefl?: number;
  ielts?: string;
  term?: string;
  university?: string;
  program?: string;
  extracurricular?: string;
  verified?: boolean;
}

interface CacheData {
  profile: ProfileData | null;
  similarCount: number;
  hasProfile: boolean;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'user_profile_cache';

class ProfileCache {
  private cache: CacheData | null = null;

  constructor() {
    // Try to load from sessionStorage on initialization
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (this.isValid(parsed.timestamp)) {
          this.cache = parsed;
        } else {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.cache && typeof window !== 'undefined') {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
      }
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  private isValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  getProfile(): ProfileData | null {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      return null;
    }
    return this.cache.profile;
  }

  getSimilarCount(): number {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      return 0;
    }
    return this.cache.similarCount;
  }

  hasProfile(): boolean {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      return false;
    }
    return this.cache.hasProfile;
  }

  isCacheValid(): boolean {
    return this.cache !== null && this.isValid(this.cache.timestamp);
  }

  setProfile(profile: ProfileData | null, hasProfile: boolean, similarCount: number = 0): void {
    this.cache = {
      profile,
      similarCount,
      hasProfile,
      timestamp: Date.now()
    };
    this.saveToStorage();
  }

  setSimilarCount(count: number): void {
    if (this.cache) {
      this.cache.similarCount = count;
      this.saveToStorage();
    }
  }

  invalidate(): void {
    this.cache = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  // Get all cache data at once
  getAll(): { profile: ProfileData | null; similarCount: number; hasProfile: boolean } | null {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      return null;
    }
    return {
      profile: this.cache.profile,
      similarCount: this.cache.similarCount,
      hasProfile: this.cache.hasProfile
    };
  }
}

// Export singleton instance
export const profileCache = new ProfileCache();

// Helper functions for easier usage
export const getProfileFromCache = () => profileCache.getProfile();
export const getSimilarCountFromCache = () => profileCache.getSimilarCount();
export const hasProfileInCache = () => profileCache.hasProfile();
export const isCacheValid = () => profileCache.isCacheValid();
export const setProfileCache = (profile: ProfileData | null, hasProfile: boolean, similarCount?: number) => 
  profileCache.setProfile(profile, hasProfile, similarCount);
export const invalidateProfileCache = () => profileCache.invalidate();
export const getAllCacheData = () => profileCache.getAll();