
import supabase from "./supabase";
export const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
        console.log('no files');
        return null;
    }
    
    console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
    });
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `images/${fileName}`;
        
        console.log('Uploading to path:', filePath);
        console.log('Bucket name:', 'imageContainer');
        
        const { data, error } = await supabase.storage
            .from('imageContainer')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) {
            console.log('Full error object:', error);
            console.log('Error message:', error.message);
            console.log('Error status:', error.name);
            throw error;
        }

        console.log('Upload successful, data:', data);

        const { data: downloadUrl } = supabase.storage
            .from('imageContainer')
            .getPublicUrl(filePath);
            
        return downloadUrl.publicUrl;

    } catch (err) {
        console.log('Caught error:', err);
        return null;
    }
}