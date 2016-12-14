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
  let toSonicPi noteList =
    let replace f (r:string) (s:string) = 
      s.Replace(f,r)

    noteList 
      |> List.map( fun note ->
        (sprintf "%A" note)
          |> (replace "Flat" "b" >> replace "Sharp""s")
      )

let cIonian = createScale LydianAugmented C
cIonian |> SonicPiConverter.toSonicPi