#r "../node_modules/fable-core/Fable.Core.dll"
#r "../packages/Vaughan/lib/net45/Vaughan.dll"

open Fable.Core
open Fable.Core.JsInterop
open Fable.Import
open System.Text.RegularExpressions

open Vaughan.Notes
open Vaughan.Chords
open Vaughan.Guitar
open Vaughan.GuitarTab
open Vaughan.ScaleHarmonizer
open Vaughan.Scales

module SonicPiConverter =
  let private replace f (r:string) (s:string) = 
      s.Replace(f,r)
  let convertNote note =
    (sprintf "%A" note)
    |> (replace "Flat" "b" 
      >> replace "Sharp" "s"
      )

  let toChord (chord:string) = 
    let note = chord.Substring(0,1)
    let isMinor = Regex.IsMatch(chord,"Min",RegexOptions.IgnoreCase)
    let tone = if isMinor then "minor" else "major"
    sprintf "chord(:%s,:%s)" note tone

  let toSonicPiNotation noteList =
    noteList |> List.map convertNote

module Composer =   
  let private getSonicChord chord degree = 
    chord
      |> triadsHarmonizer degree 
      |> name
      |> SonicPiConverter.toChord 

  let anatole = [
      ScaleDgrees.I
      ScaleDgrees.VI
      ScaleDgrees.II
      ScaleDgrees.V
    ] 
  let getChords suite baseChord = 
    suite |> List.map( fun d -> getSonicChord baseChord d )

let s = createScale Ionian C
let chords = Composer.getChords Composer.anatole s
