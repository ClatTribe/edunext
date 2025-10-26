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

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased)
const CACHE_KEY = 'eduportal_profile_cache_v1';

class ProfileCache {
  private cache: CacheData | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load from sessionStorage on initialization
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
          console.log('✅ Cache loaded from storage:', parsed);
        } else {
          console.log('⏰ Cache expired, clearing...');
          sessionStorage.removeItem(CACHE_KEY);
        }
      } else {
        console.log('📭 No cache found in storage');
      }
    } catch (error) {
      console.error('❌ Error loading cache:', error);
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.cache && typeof window !== 'undefined') {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        console.log('💾 Cache saved to storage');
        this.notifyListeners();
      }
    } catch (error) {
      console.error('❌ Error saving cache:', error);
    }
  }

  private isValid(timestamp: number): boolean {
    const isValid = Date.now() - timestamp < CACHE_DURATION;
    if (!isValid) {
      console.log('⏰ Cache is expired');
    }
    return isValid;
  }

  // Subscribe to cache changes
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  getProfile(): ProfileData | null {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      console.log('📭 No valid profile in cache');
      return null;
    }
    console.log('✅ Returning cached profile');
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
    const valid = this.cache !== null && this.isValid(this.cache.timestamp);
    console.log('🔍 Cache valid check:', valid);
    return valid;
  }

  setProfile(profile: ProfileData | null, hasProfile: boolean, similarCount: number = 0): void {
    console.log('📝 Setting profile cache:', { profile, hasProfile, similarCount });
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
      console.log('📊 Updating similar count:', count);
      this.cache.similarCount = count;
      this.cache.timestamp = Date.now(); // Update timestamp
      this.saveToStorage();
    }
  }

  updateProfile(updates: Partial<ProfileData>): void {
    if (this.cache && this.cache.profile) {
      console.log('🔄 Updating profile cache:', updates);
      this.cache.profile = { ...this.cache.profile, ...updates };
      this.cache.timestamp = Date.now();
      this.saveToStorage();
    }
  }

  invalidate(): void {
    console.log('🗑️ Invalidating cache');
    this.cache = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
    }
    this.notifyListeners();
  }

  // Get all cache data at once
  getAll(): { profile: ProfileData | null; similarCount: number; hasProfile: boolean } | null {
    if (!this.cache || !this.isValid(this.cache.timestamp)) {
      console.log('📭 No valid cache data');
      return null;
    }
    console.log('✅ Returning all cache data');
    return {
      profile: this.cache.profile,
      similarCount: this.cache.similarCount,
      hasProfile: this.cache.hasProfile
    };
  }

  // Force refresh - keeps cache but marks it as needing refresh
  markForRefresh(): void {
    if (this.cache) {
      console.log('🔄 Marking cache for refresh');
      this.cache.timestamp = 0; // Force cache to be invalid
      this.saveToStorage();
    }
  }

  // Get cache age in seconds
  getCacheAge(): number {
    if (!this.cache) return -1;
    return Math.floor((Date.now() - this.cache.timestamp) / 1000);
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
export const updateProfileCache = (updates: Partial<ProfileData>) => profileCache.updateProfile(updates);
export const invalidateProfileCache = () => profileCache.invalidate();
export const getAllCacheData = () => profileCache.getAll();
export const markCacheForRefresh = () => profileCache.markForRefresh();
export const getCacheAge = () => profileCache.getCacheAge();

// Debug helper
export const debugCache = () => {
  console.log('🔍 Cache Debug Info:');
  console.log('Valid:', profileCache.isCacheValid());
  console.log('Age (seconds):', profileCache.getCacheAge());
  console.log('Data:', profileCache.getAll());
};