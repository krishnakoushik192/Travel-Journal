package com.traveljournal

import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions

class ImageTaggerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ImageTagger"
    }

    @ReactMethod
    fun getImageTags(imagePath: String, promise: Promise) {
        try {
            val bitmap = BitmapFactory.decodeFile(imagePath)
            val image = InputImage.fromBitmap(bitmap, 0)

            val labeler = ImageLabeling.getClient(ImageLabelerOptions.DEFAULT_OPTIONS)
            labeler.process(image)
                .addOnSuccessListener { labels ->
                    val tagList = labels.map { it.text }
                    promise.resolve(tagList)
                }
                .addOnFailureListener { e ->
                    promise.reject("TAGGING_ERROR", e)
                }
        } catch (e: Exception) {
            promise.reject("IMAGE_PROCESS_ERROR", e)
        }
    }
}